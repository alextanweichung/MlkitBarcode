import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { TransferOutRoot, TransferOutLine, TransferOutList } from "../models/transfer-out";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})

export class TransferOutService {

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
    await this.loadMasterList();
    await this.loadConsignmentLocation();
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

  header: TransferOutRoot;
  detail: TransferOutLine[] = [];
  object: TransferOutRoot;
  async setHeader(header: TransferOutRoot) {
    this.header = header;
  }

  setLine(detail: TransferOutLine[]) {
    this.detail = JSON.parse(JSON.stringify(detail));
  }

  setObject(object: TransferOutRoot) {
    this.object = object;
  }

  removeHeader() {
    this.header = null;
  }

  removeLine() {
    this.detail = [];
  }

  removeObject() {
    this.object = null;
  }

  resetVariables() {
    this.removeHeader();
    this.removeLine();
    this.removeObject();
  }

  /* #endregion */

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/masterlist").toPromise();
  }

  getConsignmentLocation() {
    return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/consignmentLocation").toPromise();
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/staticLov");
  }

  getObjectList(dateStart: string, dateEnd: string) {
    return this.http.get<TransferOutList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferOut/toList/${dateStart}/${dateEnd}`);
  }

  getObjectById(objectId: number) {
    return this.http.get<TransferOutRoot>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/" + objectId);
  }

  insertObject(object: TransferOutRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut", object, httpObserveHeader);
  }

  updateObject(object: TransferOutRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferOut", object, httpObserveHeader);
  }

  completeObject(objectId: number) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferOut/generateDocument/${objectId}`, null, httpObserveHeader)
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/exportPdf",
      {
        "appCode": appCode,
        "format": format,
        "documentIds": [documentId],
        "reportName": reportName ?? null
      },
      { responseType: "blob" });
  }

  // for web testing 
  validateBarcode(barcode: string) {
    return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/itemByBarcode/" + barcode);
  }

}
