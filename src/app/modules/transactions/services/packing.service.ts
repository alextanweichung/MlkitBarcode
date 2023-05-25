import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { GoodsPackingHeader, GoodsPackingLine, GoodsPackingList, GoodsPackingRoot, GoodsPackingSummary } from '../models/packing';
import { PackingSalesOrderDetail, PackingSalesOrderRoot } from '../models/packing-sales-order';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

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

  header: GoodsPackingHeader;
  setHeader(header: GoodsPackingHeader) {
    this.header = header;
  }

  selectedSalesOrders: PackingSalesOrderRoot[] = [];
  setChoosenSalesOrders(psos: PackingSalesOrderRoot[]) {
    this.selectedSalesOrders = psos;
  }

  selectedSalesOrderLines: PackingSalesOrderDetail[] = [];
  setChooseSalesOrderLines(soLines: PackingSalesOrderDetail[]) {
    this.selectedSalesOrderLines = soLines;
  }

  objectSummary: GoodsPackingSummary;
  setPackingSummary(objectSummary: GoodsPackingSummary) {
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

  removePackingSummary() {
    this.objectSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeSalesOrders();
    this.removeSalesOrderLines();
    this.removePackingSummary();
  }

  hasWarehouseAgent(): boolean {
    let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
    if (warehouseAgentId === undefined || warehouseAgentId === null || warehouseAgentId === 0) {
      return false;
    }
    return true
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePacking/masterList").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePacking/staticLov");
  }

  getObjectList() {
    return this.http.get<GoodsPackingList[]>(this.configService.selected_sys_param.apiUrl + "MobilePacking/gpList");
  }

  getObjectListByDate(startDate: Date, endDate: Date) {
    return this.http.get<GoodsPackingList[]>(this.configService.selected_sys_param.apiUrl + "MobilePacking/listing/" + format(startDate, 'yyyy-MM-dd') + "/" + format(endDate, 'yyyy-MM-dd'));
  }

  getObjectById(objectId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobilePacking/" + objectId);
  }

  getSoByCustomer(customerId: number) {
    return this.http.get<PackingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePacking/fromSO/customer/" + customerId);
  }

  getSoByCustomerLocation(customerId: number, toLocationId: number){
    return this.http.get<PackingSalesOrderRoot[]>(this.configService.selected_sys_param.apiUrl + "MobilePacking/fromSo/customer/" + customerId + "/" + toLocationId);
  }

  insertPacking(object: GoodsPackingRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePacking", object, httpObserveHeader);
  }

  getItemInfoByBarcode(barcode: string) {
    return this.http.get<ItemBarcodeModel>(this.configService.selected_sys_param.apiUrl + "MobilePacking/item/" + barcode);
  }
  
}
