import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MultiPackingHeader, MultiPackingRoot, MultiPackingObject, MultiPackingList } from "../models/packing";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { ItemImage } from "../models/item";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { background_load } from "src/app/core/interceptors/error-handler.interceptor";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class PackingService {
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    
  }

  /* #region store as one set data for each picking */

  header: MultiPackingHeader;
  object: MultiPackingRoot;
  setHeader(header: MultiPackingHeader) {
    this.header = header;
  }

  multiPackingObject: MultiPackingObject = { outstandingPackList: [], packingCarton: [] };
  setMultiPackingObject(object: MultiPackingObject) {
    this.multiPackingObject = object;
  }

  setPackingSummary(object: MultiPackingRoot) {
    this.object = object;
  }

  removeHeader() {
    this.header = null;
  }

  removeMultiPackingObject() {
    this.multiPackingObject = { outstandingPackList: [], packingCarton: [] };
  }

  removePackingSummary() {
    this.object = null;
  }

  resetVariables() {
    this.removeHeader();
    this.removeMultiPackingObject();
    this.removePackingSummary();
  }

  /* #endregion */

  /* #region get data */

  getUniqueSo(): string[] {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      return [...new Set(this.multiPackingObject.outstandingPackList.flatMap(r => r.salesOrderNum))];
    }
    return [];
  }

  getUniqueItem(): string[] { //{ itemCode: string, variationTypeCode: string, isSelected: boolean }[] {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      return [...new Set(this.multiPackingObject.outstandingPackList.flatMap(r => r.itemCode))];
    }
    return [];
  }

  getItemDescriptionByItemCode(itemCode: string): string {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let description = "";
      let found = this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode);
      if (found) {
        return found.description;
      }
    }
    return null;
  }

  getLocationByItemCode(itemCode: string): string {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let location = "";
      let found = this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode);
      // if (found && found.rack) {
      //    location += found.rack;
      // }
      // if (found && found.subRack) {
      //    location += " - " + found.subRack;
      // }
      return location;
    }
    return null;
  }

  getQtyRequestByItemCode(itemCode: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      return this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
    }
    return 0;
  }

  // getQtyPickedByItemCode(itemCode: string): number {
  //   if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
  //     let qtyPickedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
  //     if (this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.isComponentScan) { // here to return isComponentScan item
  //       let assemblyComputedQty = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
  //       return Math.trunc(qtyPickedByOther + assemblyComputedQty);
  //     } else {
  //       if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) { // this part cannot calculate isComponentScan item
  //         let qtyPickedCurrent = this.multiPackingObject.packingCarton.flatMap(r => r.packList).filter(r => r.itemCode === itemCode && (r.assemblyItemId ?? null) === null).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
  //         return Math.trunc(qtyPickedByOther + qtyPickedCurrent);
  //       }
  //     }
  //     return Math.trunc(qtyPickedByOther);
  //   }
  //   return 0;
  // }

  getQtyPackedByItemCode(itemCode: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let qtyPickedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
      if (this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.isComponentScan) { // here to return isComponentScan item
        let assemblyComputedQty = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
        return Math.trunc(qtyPickedByOther + assemblyComputedQty);
      } else {
        if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) { // this part cannot calculate isComponentScan item
          let qtyPickedCurrent = this.multiPackingObject.packingCarton.flatMap(r => r.packList).filter(r => r.itemCode === itemCode && (r.assemblyItemId ?? null) === null).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
          return Math.trunc(qtyPickedByOther + qtyPickedCurrent);
        }
      }
      return Math.trunc(qtyPickedByOther);
    }
    return 0;
  }

  getQtyRequestByItemSku(itemSku: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      return this.multiPackingObject.outstandingPackList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
    }
    return 0;
  }

  // getQtyPickedByItemSku(itemSku: string): number {
  //   if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
  //     let qtyPickedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
  //     if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) {
  //       let qtyPickedCurrent = this.multiPackingObject.packingCarton.flatMap(r => r.packList).filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
  //       return qtyPickedByOther + qtyPickedCurrent;
  //     }
  //     return qtyPickedByOther;
  //   }
  //   return 0;
  // }

  getQtyPackedByItemSku(itemSku: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let qtyPackedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
      if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) {
        let qtyPackedCurrent = this.multiPackingObject.packingCarton.flatMap(r => r.packList).filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
        return qtyPackedByOther + qtyPackedCurrent;
      }
      return qtyPackedByOther;
    }
    return 0;
  }

  getProgressByItemCode(itemCode: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let total = this.getQtyRequestByItemCode(itemCode);
      if (total === 0) {
        return 0;
      }
      let qtyPacked = this.getQtyPackedByItemCode(itemCode);
      if (qtyPacked === 0) {
        return 0;
      }
      return (qtyPacked / total) * 100;
    }
    return 0;
  }

  getQtyRequestBySoNum(salesOrderNum: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      return this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
    }
    return 0;
  }

  // getQtyPickedBySoNum(salesOrderNum: string): number {
  //   if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
  //     let qtyPickedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
  //     if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) {
  //       let qtyPickedCurrent = this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
  //       return qtyPickedByOther + qtyPickedCurrent;
  //     }
  //     return qtyPickedByOther;
  //   }
  //   return 0;
  // }

  getQtyPackedBySoNum(salesOrderNum: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let qtyPackedByOther = this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
      if (this.multiPackingObject && this.multiPackingObject.packingCarton.length > 0) {
        let qtyPackedCurrent = this.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
        return qtyPackedByOther + qtyPackedCurrent;
      }
      return qtyPackedByOther;
    }
    return 0;
  }

  getProgressBySoNum(salesOrderNum: string): number {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let total = this.getQtyRequestBySoNum(salesOrderNum);
      if (total === 0) {
        return 0;
      }
      let qtyPacked = this.getQtyPackedBySoNum(salesOrderNum);
      if (qtyPacked === 0) {
        return 0;
      }
      return (qtyPacked / total) * 100;
    }
    return 0;
  }

  getItemVariation(itemCode: string): { itemSku: string, variationTypeCode: string, xDesc: string, yDesc: string }[] {
    if (this.multiPackingObject && this.multiPackingObject.outstandingPackList.length > 0) {
      let lines = this.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode);
      if (lines && lines.length > 0) {
        let results: any[] = [];
        lines.forEach(r => {
          if (!results.flatMap(rr => rr.itemSku).includes(r.itemSku)) {
            results.push({ itemSku: r.itemSku, variationTypeCode: r.variationTypeCode, xDesc: r.itemVariationXDescription, yDesc: r.itemVariationYDescription });
          }
        })
        return results;
      }
      return [];
    }
    return [];
  }

  isItemComponentScan(itemCode: string) {
    return this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.isComponentScan;
  }

  getItemAssembly(itemCode: string) {
    return this.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode)?.assembly;
  }

  /* #endregion */

  hasWarehouseAgent(): boolean {
    let warehouseAgentId = JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId;
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
  reasonMasterList: MasterListDetails[] = [];
  packagingMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
    await this.customerMasterList.sort((a, c) => { return a.code > c.code ? 1 : -1 });
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details).filter(y => y.deactivated === 0);
    this.warehouseAgentMasterList = this.fullMasterList.filter(x => x.objectName === "WarehouseAgent").flatMap(src => src.details).filter(y => y.deactivated === 0);
    this.reasonMasterList = this.fullMasterList.filter(x => x.objectName === "Reason").flatMap(src => src.details).filter(y => y.deactivated === 0);
    this.packagingMasterList = this.fullMasterList.filter(x => x.objectName === "Packaging").flatMap(src => src.details).filter(y => y.deactivated === 0);
  }

  fullStaticLovList: MasterList[] = [];
  groupTypeMasterList: MasterListDetails[] = [];
  async loadStaticLov() {
    this.fullStaticLovList = await this.getStaticLov();
    this.groupTypeMasterList = this.fullMasterList.filter(x => x.objectName === "MultiPackingGroupType").flatMap(src => src.details).filter(y => y.deactivated === 0);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/masterList").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/staticLov").toPromise();
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<MultiPackingList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/" + objectId);
  }

  getSOHeader(object: string[]) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/getSOHeader", object, httpObserveHeader);
  }

  getB2BHeader(object: string[]) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/getB2bHeader", object, httpObserveHeader);
  }

  insertObject(object: MultiPackingRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking", object, httpObserveHeader);
  }

  updateObject(object: MultiPackingRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking", object, httpObserveHeader);
  }

  getItemImage(itemId: number) {
    return this.http.get<ItemImage[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/itemList/imageFile/" + itemId, { context: background_load() });
  }

  sendDebug(debugObject: JsonDebug) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/jsonDebug", debugObject, httpObserveHeader);
  }

  // for web testing 
  validateBarcode(barcode: string) {
    return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileMultiPacking/itemByBarcode/" + barcode);
  }

}
