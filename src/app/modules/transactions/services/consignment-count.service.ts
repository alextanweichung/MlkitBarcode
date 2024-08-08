import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { ConsignmentCountDetail, ConsignmentCountHeader, ConsignmentCountRoot } from "../models/consignment-count";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ConsignmentSalesLocation } from "../models/consignment-sales";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { LocalTransaction } from "src/app/shared/models/pos-download";
import { SearchDropdownList } from "src/app/shared/models/search-dropdown-list";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class ConsignmentCountService {

   filterStartDate: Date;
   filterEndDate: Date;
   filterLocationId: number[] = [];

   trxKey: string = "consignmentCount";

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
   }

   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName == "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.locationMasterList.filter(r => r.attribute1 === "C" && (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.bindLocationList();
   }

   locationSearchDropdownList: SearchDropdownList[] = [];
   async bindLocationList() {
      this.locationSearchDropdownList = [];
      for await (let r of this.locationMasterList) {
         this.locationSearchDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
         })
      }
   }

   objectHeader: ConsignmentCountHeader;
   setHeader(objectHeader: ConsignmentCountHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: ConsignmentCountDetail[] = []
   setLines(objectDetail: ConsignmentCountDetail[]) {
      this.objectDetail = objectDetail;
   }

   localObject: LocalTransaction;
   setLocalObject(localObject: LocalTransaction) {
      this.localObject = localObject;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeLines() {
      this.objectDetail = [];
   }

   removeLocalObject() {
      this.localObject = null;
   }

   async resetVariables() {
      this.removeHeader();
      this.removeLines();
      this.removeLocalObject();
      await this.configService.removeFromLocalStorage(this.trxKey);
   }

   // locationList: ConsignmentSalesLocation[] = [];
   // async loadConsignmentLocation() {
   //   this.locationList = await this.getConsignmentLocation();
   // }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/consignmentLocation").toPromise();
   // }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/masterList").toPromise();
   }

   // getObjects() {
   getObjects(dateStart: string, dateEnd: string) {
      return this.http.get<ConsignmentCountHeader[]>(this.configService.selected_sys_param.apiUrl + `MobileConsignmentCount/cclist/${dateStart}/${dateEnd}`);
      // return this.http.get<ConsignmentCountHeader[]>(this.configService.selected_sys_param.apiUrl + `MobileConsignmentCount`);
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

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileConsignmentCount/jsonDebug", debugObject, httpObserveHeader);
   }

}
