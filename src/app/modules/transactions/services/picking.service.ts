import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { GoodsPickingHeader, GoodsPickingList, GoodsPickingRoot, PickingSummary } from '../models/picking';
import { PickingSalesOrderDetail, PickingSalesOrderRoot } from '../models/picking-sales-order'
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

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

  header: GoodsPickingHeader;
  setHeader(header: GoodsPickingHeader) {
    this.header = header;
  }

  selectedSalesOrders: PickingSalesOrderRoot[] = [];
  setChoosenSalesOrders(psos: PickingSalesOrderRoot[]) {
    this.selectedSalesOrders = psos;
  }

  selectedSalesOrderLines: PickingSalesOrderDetail[] = [];
  setChooseSalesOrderLines(soLines: PickingSalesOrderDetail[]) {
    this.selectedSalesOrderLines = soLines;
  }

  objectSummary: PickingSummary;
  setPickingSummary(objectSummary: PickingSummary) {
    this.objectSummary = objectSummary;
  }

  removeCustomer() {
    this.header = null;
  }

  removeSalesOrders() {
    this.selectedSalesOrders = [];
  }

  removeSalesOrderLines() {
    this.selectedSalesOrderLines = [];
  }

  removePickingSummary() {
    this.objectSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeSalesOrders();
    this.removeSalesOrderLines();
    this.removePickingSummary();
  }

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
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details);
  }

  async loadStaticLov() {

  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/masterList").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/staticLov").toPromise();
  }

  getObjectList() {
    return this.http.get<GoodsPickingList[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/gpList");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<GoodsPickingList[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobilePicking/" + objectId);
  }

  getSoByCustomer(customerId: number) {
    return this.http.get<PickingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/fromSO/customer/" + customerId);
  }

  getSoByCustomerLocation(customerId: number, toLocationId: number){
    return this.http.get<PickingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePicking/fromSo/customer/" + customerId + "/" + toLocationId);
  }

  insertPicking(object: GoodsPickingRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePicking", object, httpObserveHeader);
  }

}
