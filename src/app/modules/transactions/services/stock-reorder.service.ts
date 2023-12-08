import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { StockReorderLine, StockReorderList, StockReorderRoot } from "../models/stock-reorder";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { JsonDebug } from "src/app/shared/models/jsonDebug";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class StockReorderService {

   fullMasterList: MasterList[] = [];
   salesType: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];

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
      this.locationMasterList = this.locationMasterList.filter(r => this.configService.loginUser.locationId.includes(r.id));
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details);
   }

   // locationList: ConsignmentSalesLocation[] = [];
   // async loadConsignmentLocation() {
   //   this.locationList = await this.getConsignmentLocation();
   // }

   /* #region  for insert */

   header: StockReorderRoot;
   itemInCart: StockReorderLine[] = [];
   object: StockReorderRoot;
   async setHeader(header: StockReorderRoot) {
      this.header = header;
   }

   setChoosenItems(items: StockReorderLine[]) {
      this.itemInCart = JSON.parse(JSON.stringify(items));
   }

   setObject(object: StockReorderRoot) {
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
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/masterlist").toPromise();
   }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/consignmentLocation").toPromise();
   // }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/staticLov");
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<StockReorderList[]>(this.configService.selected_sys_param.apiUrl + `MobileStockReorder/srlist/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<StockReorderRoot>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/" + objectId);
   }

   insertObject(object: StockReorderRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReorder", object, httpObserveHeader);
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileStockReorder/generateDocument/${objectId}`, null, httpObserveHeader)
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/jsonDebug", debugObject, httpObserveHeader);
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileStockReorder/itemByBarcode/" + barcode);
   }

}
