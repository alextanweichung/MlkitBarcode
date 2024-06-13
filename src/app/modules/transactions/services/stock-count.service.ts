import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { BarcodeTag, ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { InventoryCountBatchCriteria, InventoryCountBatchList, StockCount, StockCountDetail, StockCountHeader, StockCountList, StockCountRoot } from '../models/stock-count';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class StockCountService {

   filterStartDate: Date;
   filterEndDate: Date;

   trxKey: string = "inventoryCount";

   constructor(
      private http: HttpClient,
      private configService: ConfigService,
      private authService: AuthService
   ) { }

   async loadRequiredMaster() {
      await this.loadModuleControl();
      await this.loadMasterList();
   }

   moduleControl: ModuleControl[];
   configInvCountFreeTextZoneRack: boolean = false;
   configInvCountActivateLineWithBin: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;

         let invCountFreeTextZoneRack = this.moduleControl.find(x => x.ctrlName === "InvCountFreeTextZoneRack");
         if (invCountFreeTextZoneRack && invCountFreeTextZoneRack.ctrlValue.toUpperCase() === "Y") {
            this.configInvCountFreeTextZoneRack = true;
         } else {
            this.configInvCountFreeTextZoneRack = false;
         }

         let InvCountActivateLineWithBin = this.moduleControl.find(x => x.ctrlName === "InvCountActivateLineWithBin");
         if (InvCountActivateLineWithBin && InvCountActivateLineWithBin.ctrlValue.toUpperCase() === "Y") {
            this.configInvCountActivateLineWithBin = true;
         } else {
            this.configInvCountActivateLineWithBin = false;
         }
      })
   }

   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   rackMasterList: MasterListDetails[] = [];
   zoneMasterList: MasterListDetails[] = [];
   itemBrandMasterList: MasterListDetails[] = [];
   itemGroupMasterList: MasterListDetails[] = [];
   itemCategoryMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.locationMasterList = this.locationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.itemBrandMasterList = this.fullMasterList.filter(x => x.objectName === "ItemBrand").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemGroupMasterList = this.fullMasterList.filter(x => x.objectName === "ItemCategory").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemCategoryMasterList = this.fullMasterList.filter(x => x.objectName === "ItemGroup").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.rackMasterList = this.fullMasterList.filter(x => x.objectName === "Rack").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.zoneMasterList = this.fullMasterList.filter(x => x.objectName === "Zone").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   objectHeader: StockCountHeader = null;
   setHeader(objectHeader: StockCountHeader) {
      this.objectHeader = objectHeader;
   }

   objectDetail: StockCountDetail[] = []
   setLines(objectDetail: StockCountDetail[]) {
      this.objectDetail = objectDetail;
   }

   objectBarcodeTag: BarcodeTag[] = [];
   setBarcodeTag(objectBarcodeTag: BarcodeTag[]) {
      this.objectBarcodeTag = objectBarcodeTag;
   }

   removeHeader() {
      this.objectHeader = null
   }

   removeDetail() {
      this.objectDetail = [];
   }

   removeBarcodeTag() {
      this.objectBarcodeTag = [];
   }

   async resetVariables() {
      this.removeHeader();
      this.removeDetail();
      this.removeBarcodeTag();
      await this.configService.removeFromLocalStorage(this.trxKey);
      var data = await this.configService.retrieveFromLocalStorage(this.trxKey);
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/masterList").toPromise();
   }

   getInventoryCountByDate(startDate, endDate) {
      return this.http.get<StockCount[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/listing/" + startDate + "/" + endDate);
   }

   getInventoryCountList() {
      return this.http.get<StockCountList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/iclist");
   }

   getInventoryCount(inventoryCountId: number) {
      return this.http.get<StockCountRoot>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/" + inventoryCountId);
   }

   getInventoryCountBatchByLocationId(locationId: number) {
      return this.http.get<InventoryCountBatchList[]>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/batchlist/" + locationId);
   }

   getInventoryCountBatchCriteria(inventoryCountBatchId: number) {
      return this.http.get<InventoryCountBatchCriteria>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/batchRandomList/" + inventoryCountBatchId);
   }

   getItemInfoByBarcode(barcode: string) {
      return this.http.get<ItemBarcodeModel>(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/itemByBarcode/" + barcode);
   }

   insertInventoryCount(inventoryCountRoot: StockCountRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount", inventoryCountRoot, httpObserveHeader);
   }

   updateInventoryCount(inventoryCountRoot: StockCountRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount", inventoryCountRoot, httpObserveHeader);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileInventoryCount/jsonDebug", debugObject, httpObserveHeader);
   }

}
