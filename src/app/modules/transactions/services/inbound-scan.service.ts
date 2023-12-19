import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { InboundScanDocRoot, InboundScanList, InboundScanRoot } from "../models/inbound-scan";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class InboundScanService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  /* #region store as one set data for each picking */

  object: InboundScanRoot;
  setObject(object: InboundScanRoot) {
    this.object = object;
  }

  doc: InboundScanDocRoot;
  setDoc(doc: InboundScanDocRoot) {
    this.doc = doc;
  }

  removeObject() {
    this.object = null;
  }

  removeDoc() {
    this.doc = null;
  }

  resetVariables() {
    this.removeObject();
    this.removeDoc();
  }

  /* #endregion */

  hasWarehouseAgent(): boolean {
    let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
    if (warehouseAgentId === undefined || warehouseAgentId === null || warehouseAgentId === 0) {
      return false;
    }
    return true
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadStaticLov();
  }

  fullMasterList: MasterList[] = [];
  customerMasterList: MasterListDetails[] = [];
  itemUomMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  warehouseAgentMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.customerMasterList = this.fullMasterList.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
    await this.customerMasterList.sort((a, c) => { return a.code > c.code ? 1 : -1 });
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  fullStaticLovList: MasterList[] = [];
  salesTypeMasterList: MasterListDetails[] = [];
  sourceTypeMasterList: MasterListDetails[] = [];
  async loadStaticLov() {
    this.fullStaticLovList = await this.getStaticLov();
    this.salesTypeMasterList = this.fullMasterList.filter(x => x.objectName == "SalesType").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.sourceTypeMasterList = this.fullMasterList.filter(x => x.objectName == "SourceType").flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInboundScan/masterList").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInboundScan/staticLov").toPromise();
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<InboundScanList[]>(this.configService.selected_sys_param.apiUrl + "MobileInboundScan/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<InboundScanRoot>(this.configService.selected_sys_param.apiUrl + "MobileInboundScan/" + objectId);
  }

  getDoc(search: string) {
    return this.http.get<InboundScanDocRoot[]>(this.configService.selected_sys_param.apiUrl + `MobileInboundScan/fromIT/${search}`);
  }


  // for web testing 
  validateBarcode(barcode: string) {
    return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileInboundScan/itemByBarcode/" + barcode);
  }

}