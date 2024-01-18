import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { TransferInScanningRoot, TransferInScanningLine, TransferInScanningList } from "../models/transfer-in-scanning";
import { JsonDebug } from "src/app/shared/models/jsonDebug";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class TransferInScanningService {

   filterStartDate: Date;
   filterEndDate: Date;

   // selectedConsignmentLocation: ConsignmentSalesLocation = null;

   fullMasterList: MasterList[] = [];
   interTransferTypeList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];

   selectedLocation: number;

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
      // await this.loadConsignmentLocation();
   }

   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details);
      this.locationMasterList = this.locationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details);
   }

   // locationList: ConsignmentSalesLocation[] = [];
   // async loadConsignmentLocation() {
   //   this.locationList = await this.getConsignmentLocation();
   // }

   /* #region  for insert */

   object: TransferInScanningRoot;
   setObject(object: TransferInScanningRoot) {
      this.object = object;
   }

   removeObject() {
      this.object = null;
   }

   resetVariables() {
      this.removeObject();
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning/masterlist").toPromise();
   }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning/consignmentLocation").toPromise();
   // }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning/staticLov");
   }

   getPendingList(locationCode: string) {
      return this.http.get<TransferInScanningRoot[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferInScanning/pending/${locationCode}`);
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<TransferInScanningList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferInScanning/islist/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<TransferInScanningRoot>(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning/" + objectId);
   }

   insertObject(object: TransferInScanningRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning", object, httpObserveHeader);
   }

   updateObject(object: TransferInScanningRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning", object, httpObserveHeader);
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferInScanning/generateDocument/${objectId}`, null, httpObserveHeader)
   }

   undoObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferInScanning/undoDocument/${objectId}`, null, httpObserveHeader)
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning/itemByBarcode/" + barcode);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferInScanning/jsonDebug", debugObject, httpObserveHeader);
   }

}
