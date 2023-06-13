import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { MultiPickingHeader, MultiPickingList, MultiPickingObject, MultiPickingRoot, MultiPickingSORequest, MultiPickingSalesOrder } from '../models/picking';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ItemImage } from '../models/item';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class PickingService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {

  }

  /* #region store as one set data for each picking */

  header: MultiPickingHeader;
  object: MultiPickingRoot;
  setHeader(header: MultiPickingHeader) {
    console.log("🚀 ~ file: picking.service.ts:28 ~ PickingService ~ setHeader ~ header:", header)
    this.header = header;
  }

  multiPickingObject: MultiPickingObject = { outstandingPickList: [], pickingCarton: [] };
  setMultiPickingObject(object: MultiPickingObject) {
    console.log("🚀 ~ file: picking.service.ts:40 ~ PickingService ~ setMultiPickingObject ~ object:", object)
    this.multiPickingObject = object;
  }

  setPickingSummary(object: MultiPickingRoot) {
    this.object = object;
  }

  removeCustomer() {
    this.header = null;
  }

  removeMultiPickingObject() {
    this.multiPickingObject = { outstandingPickList: [], pickingCarton: [] };
  }

  removePickingSummary() {
    this.object = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeMultiPickingObject();
    this.removePickingSummary();
  }

  /* #endregion */

  /* #region get data */

  getUniqueSo(): string[] {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      return [...new Set(this.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
    }
    return [];
  }

  getUniqueItem(): string[] { //{ itemCode: string, variationTypeCode: string, isSelected: boolean }[] {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      return [...new Set(this.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
      // let result: { itemCode: string, variationTypeCode: string, isSelected: boolean }[] = [];
      // let uniqueItemCode = [...new Set(this.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
      // uniqueItemCode.forEach(r => {
      //   result.push({
      //     itemCode: r,
      //     variationTypeCode: this.multiPickingObject.outstandingPickList.find(rr => rr.itemCode === r).variationTypeCode,
      //     isSelected: false
      //   })
      // })
      // return result;
    }
    return [];
  }

  getItemDescriptionByItemCode(itemCode: string): string {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let description = '';
      let found = this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode);
      if (found) {
        return found.description;
      }
    }
    return null;
  }

  getLocationByItemCode(itemCode: string): string {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let location = '';
      let found = this.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode);
      if (found && found.rack) {
        location += found.rack;
      }
      if (found && found.subRack) {
        location += ' - ' + found.subRack;
      }
      return location;
    }
    return null;
  }

  getQtyRequestByItemCode(itemCode: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      return this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
    }
    return 0;
  }

  getQtyPickedByItemCode(itemCode: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let qtyPickedByOther = this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
      if (this.multiPickingObject && this.multiPickingObject.pickingCarton.length > 0) {
        let qtyPickedCurrent = this.multiPickingObject.pickingCarton.flatMap(r => r.pickList).filter(r => r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
        return qtyPickedByOther + qtyPickedCurrent;
      }
      return qtyPickedByOther;
    }
    return 0;
  }

  getQtyRequestByItemSku(itemSku: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      return this.multiPickingObject.outstandingPickList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
    }
    return 0;
  }

  getQtyPickedByItemSku(itemSku: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let qtyPickedByOther = this.multiPickingObject.outstandingPickList.filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
      if (this.multiPickingObject && this.multiPickingObject.pickingCarton.length > 0) {
        let qtyPickedCurrent = this.multiPickingObject.pickingCarton.flatMap(r => r.pickList).filter(r => r.itemSku === itemSku).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
        return qtyPickedByOther + qtyPickedCurrent;
      }
      return qtyPickedByOther;
    }
    return 0;
  }

  getProgressByItemCode(itemCode: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let total = this.getQtyRequestByItemCode(itemCode);
      if (total === 0) {
        return 0;
      }
      let qtyPicked = this.getQtyPickedByItemCode(itemCode);
      if (qtyPicked === 0) {
        return 0;
      }
      return (qtyPicked / total) * 100;
    }
    return 0;
  }

  getQtyRequestBySoNum(salesOrderNum: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      return this.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
    }
    return 0;
  }

  getQtyPickedBySoNum(salesOrderNum: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let qtyPickedByOther = this.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
      if (this.multiPickingObject && this.multiPickingObject.pickingCarton.length > 0) {
        let qtyPickedCurrent = this.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
        return qtyPickedByOther + qtyPickedCurrent;
      }
      return qtyPickedByOther;
    }
    return 0;
  }

  getProgressBySoNum(salesOrderNum: string): number {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let total = this.getQtyRequestBySoNum(salesOrderNum);
      if (total === 0) {
        return 0;
      }
      let qtyPicked = this.getQtyPickedBySoNum(salesOrderNum);
      if (qtyPicked === 0) {
        return 0;
      }
      return (qtyPicked / total) * 100;
    }
    return 0;
  }

  getItemVariation(itemCode: string): { itemSku: string, variationTypeCode: string, xDesc: string, yDesc: string }[] {
    if (this.multiPickingObject && this.multiPickingObject.outstandingPickList.length > 0) {
      let lines = this.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode);
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
  groupTypeMasterList: MasterListDetails[] = [];
  async loadStaticLov() {
    this.fullStaticLovList = await this.getStaticLov();
    this.groupTypeMasterList = this.fullMasterList.filter(x => x.objectName == "MultiPickingGroupType").flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/masterList").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/staticLov").toPromise();
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<MultiPickingList[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/" + objectId);
  }

  getSOHeader(object: MultiPickingSORequest) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/getSOHeader", object, httpObserveHeader);
  }

  insertObject(object: MultiPickingRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking", object, httpObserveHeader);
  }

  getItemImage(itemId: number) {
    return this.http.get<ItemImage[]>(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/itemList/imageFile/" + itemId, {context: background_load() });
  }

  // getSoByCustomer(customerId: number) {
  //   return this.http.get<PickingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/fromSO/customer/" + customerId);
  // }

  // getSoByCustomerLocation(customerId: number, toLocationId: number){
  //   return this.http.get<PickingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/fromSo/customer/" + customerId + "/" + toLocationId);
  // }

  // insertPicking(object: GoodsPickingRoot) {
  //   return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePicking", object, httpObserveHeader);
  // }


  // for web testing 
  validateBarcode(barcode: string) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileMultiPicking/itemByBarcode/" + barcode);
  }

}
