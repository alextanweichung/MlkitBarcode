import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConsignmentSalesHeader, ConsignmentSalesList, ConsignmentSalesLocation, ConsignmentSalesRoot } from '../models/consignment-sales';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CommonService } from 'src/app/shared/services/common.service';
import { format } from 'date-fns';
import { PDItemMaster, PDItemBarcode, PDMarginConfig } from 'src/app/shared/models/pos-download';
import { Capacitor } from '@capacitor/core';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class ConsignmentSalesService {
  
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private configService: ConfigService
  ) { 
    
  }

  header: ConsignmentSalesHeader;
  setHeader(header: ConsignmentSalesHeader) {
    this.header = header;
  }

  object: ConsignmentSalesRoot;
  setObject(object: ConsignmentSalesRoot) {
    this.object = object;
  }

  removeHeader() {
    this.header = null;
  }

  removeObject() {
    this.object = null;
  }

  resetVariables() {
    this.removeHeader();
    this.removeObject();
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadStaticLov();
    await this.loadConsignmentLocation();
    if (Capacitor.getPlatform() !== "web" && this.locationList.filter(r => r.isPrimary).length > 0) {
      this.refreshLocalDb(this.locationList.find(r => r.isPrimary).locationCode);
    }
  }

  async refreshLocalDb(locationCode: string) {
    let rrrrr = await this.commonService.syncInboundConsignment(locationCode, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
    let itemMaster: PDItemMaster[] = rrrrr["itemMaster"];
    let itemBarcode: PDItemBarcode[] = rrrrr["itemBarcode"];
    await this.configService.syncInboundData(itemMaster, itemBarcode);
  }

  fullMasterList: MasterList[] = [];
  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  discountGroupMasterList: MasterListDetails[] = [];
  async loadMasterList() {    
    this.fullMasterList = await this.getMasterList();
    this.customerMasterList = this.fullMasterList.filter(x => x.objectName == "Customer").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName == "SalesAgent").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.currencyMasterList = this.fullMasterList.filter(x => x.objectName == "Currency").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.discountGroupMasterList = this.fullMasterList.filter(x => x.objectName == "DiscountGroup").flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  loadStaticLov() {

  }

  locationList: ConsignmentSalesLocation[] = [];
  async loadConsignmentLocation() {
    this.locationList = await this.getConsignmentLocation();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/masterList").toPromise();
  }

  getConsignmentLocation() {
    return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/consignmentLocation").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/staticlov").toPromise();
  }

  getObjectList() {
    return this.http.get<ConsignmentSalesList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/cslist");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<ConsignmentSalesList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/listing/" + startDate + "/" + endDate);
  }  

  getObjectById(objectId: number) {
    return this.http.get<ConsignmentSalesRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/" + objectId);
  }

  getExistingObject(trxDate: string, toLocationId: number) {
    return this.http.get<ConsignmentSalesRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/existing/" + trxDate + "/" + toLocationId);
  }

  insertObject(object: ConsignmentSalesRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales", object, httpObserveHeader);
  }

  updateObject(object: ConsignmentSalesRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales", object, httpObserveHeader);
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentSales/exportPdf",
      {
        "appCode": appCode,
        "format": format,
        "documentIds": [documentId],
        "reportName": reportName ?? null
      },
      { responseType: "blob" });
  }

  completeObject(objectId: number) {    
    return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileConsignmentSales/complete/${objectId}`, null, httpObserveHeader)
  }

}
