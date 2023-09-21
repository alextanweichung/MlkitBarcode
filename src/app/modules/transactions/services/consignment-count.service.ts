import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { ConsignmentCountHeader, ConsignmentCountRoot } from "../models/consignment-count";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ConsignmentSalesLocation } from "../models/consignment-sales";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class ConsignmentCountService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadConsignmentLocation();
  }

  fullMasterList: MasterList[] = [];
  itemUomMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemUOM').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.locationMasterList.filter(r => r.attribute1 === 'C');
  }

  objectHeader: ConsignmentCountHeader;
  setHeader(objectHeader: ConsignmentCountHeader) {
    this.objectHeader = objectHeader;
  }

  objectDetail: TransactionDetail[] = []
  setLines(objectDetail: TransactionDetail[]) {
    this.objectDetail = objectDetail;
  }

  removeHeader() {
    this.objectHeader = null
  }

  removeLines() {
    this.objectDetail = [];
  }

  resetVariables() {
    this.removeHeader();
    this.removeLines();
  }

  locationList: ConsignmentSalesLocation[] = [];
  async loadConsignmentLocation() {
    this.locationList = await this.getConsignmentLocation();
  }

  getConsignmentLocation() {
    return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/consignmentLocation").toPromise();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/masterList").toPromise();
  }

  getObjects() {
    return this.http.get<ConsignmentCountHeader[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount");
  }

  getObjectById(objectId: number) {
    return this.http.get<ConsignmentCountRoot>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/" + objectId);
  }

  insertObject(objectRoot: ConsignmentCountRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount", objectRoot, httpObserveHeader);
  }

  updateObject(objectRoot: ConsignmentCountRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount", objectRoot, httpObserveHeader);
  }

}
