import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { TransferInRoot, TransferInLine, TransferInList } from "../models/transfer-in";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})

export class TransferInService {

  fullMasterList: MasterList[] = [];
  interTransferTypeList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  async loadRequiredMaster() {
    await this.loadConsignmentLocation();
    await this.loadMasterList();
  }

  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details);
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details);
  }

  locationList: ConsignmentSalesLocation[] = [];
  async loadConsignmentLocation() {
    this.locationList = await this.getConsignmentLocation();
  }

  /* #region  for insert */

  header: TransferInRoot;
  itemInCart: TransferInLine[] = [];
  object: TransferInRoot;
  async setHeader(header: TransferInRoot) {
    this.header = header;
  }

  setChoosenItems(items: TransferInLine[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setObject(object: TransferInRoot) {
    this.object = object;
  }

  removeHeader() {
    this.header = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeObject() {
    this.object = null;
  }

  resetVariables() {
    this.removeHeader();
    this.removeItems();
    this.removeObject();
  }

  /* #endregion */

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/masterlist").toPromise();
  }

  getConsignmentLocation() {
    return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/consignmentLocation").toPromise();
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/staticLov");
  }

  getPendingList(locationCode: string) {
   return this.http.get<TransferInRoot[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferIn/pending/${locationCode}`);
  }

  getObjectList(dateStart: string, dateEnd: string) {
    return this.http.get<TransferInList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferIn/tilist/${dateStart}/${dateEnd}`);
  }

  getObjectById(objectId: number) {
    return this.http.get<TransferInRoot>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/" + objectId);
  }

  updateObject(object: TransferInRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferIn", object, httpObserveHeader);
  }

  completeObject(objectId: number) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferIn/generateDocument/${objectId}`, null, httpObserveHeader)
  }

  // for web testing 
  validateBarcode(barcode: string) {
    return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileTransferIn/itemByBarcode/" + barcode);
  }

}
