import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConsignmentSalesHeader, ConsignmentSalesList, ConsignmentSalesLocation, ConsignmentSalesRoot, ConsignmentSalesSummary } from '../models/consignment-sales';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class ConsignmentSalesService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { 
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  header: ConsignmentSalesHeader;
  setHeader(header: ConsignmentSalesHeader) {
    this.header = header;
  }

  summary: ConsignmentSalesSummary;
  setSummary(summary: ConsignmentSalesSummary) {
    this.summary = summary;
  }

  removeHeader() {
    this.header = null;
  }

  removeSummary() {
    this.summary = null;
  }

  resetVariables() {
    this.removeHeader();
    this.removeSummary();
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadStaticLov();
    await this.loadConsignmentLocation();
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
    this.customerMasterList = this.fullMasterList.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.currencyMasterList = this.fullMasterList.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.discountGroupMasterList = this.fullMasterList.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  loadStaticLov() {

  }

  locationList: ConsignmentSalesLocation[] = [];
  async loadConsignmentLocation() {
    this.locationList = await this.getConsignmentLocation();
  }


  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileConsignmentSales/masterList").toPromise();
  }

  getConsignmentLocation() {
    return this.http.get<ConsignmentSalesLocation[]>(this.baseUrl + "MobileConsignmentSales/consignmentLocation").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileConsignmentSales/staticlov").toPromise();
  }

  getObjectList() {
    return this.http.get<ConsignmentSalesList[]>(this.baseUrl + "MobileConsignmentSales/cslist");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<ConsignmentSalesList[]>(this.baseUrl + "MobileConsignmentSales/listing/" + startDate + "/" + endDate);
  }  

  getObjectById(objectId: number) {
    return this.http.get<ConsignmentSalesRoot>(this.baseUrl + "MobileConsignmentSales/" + objectId);
  }

  getExistingObject(trxDate: string, toLocationId: number) {
    return this.http.get<ConsignmentSalesRoot>(this.baseUrl + "MobileConsignmentSales/existing/" + trxDate + "/" + toLocationId);
  }

  insertObject(object: ConsignmentSalesRoot) {
    return this.http.post(this.baseUrl + "MobileConsignmentSales", object, httpObserveHeader);
  }

  updateObject(object: ConsignmentSalesRoot) {
    return this.http.put(this.baseUrl + "MobileConsignmentSales", object, httpObserveHeader);
  }

}
