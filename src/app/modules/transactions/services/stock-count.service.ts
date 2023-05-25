import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { InventoryCountBatchCriteria, InventoryCountBatchList, StockCount, StockCountDetail, StockCountHeader, StockCountList, StockCountRoot } from '../models/stock-count';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class StockCountService {

  

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
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
    this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemUOM').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemBrandMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemBrand').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemGroupMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemCategory').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemCategoryMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.rackMasterList = this.fullMasterList.filter(x => x.objectName == 'Rack').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.zoneMasterList = this.fullMasterList.filter(x => x.objectName == 'Zone').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  objectHeader: StockCountHeader;
  setHeader(objectHeader: StockCountHeader) {
    this.objectHeader = objectHeader;
  }
  
  objectDetail: StockCountDetail[] = []
  setLines(objectDetail: StockCountDetail[]) {
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
  
}
