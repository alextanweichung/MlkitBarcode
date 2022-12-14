import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { GoodsPackingHeader, GoodsPackingLine, GoodsPackingList, GoodsPackingRoot, GoodsPackingSummary } from '../models/packing';
import { PackingSalesOrderDetail, PackingSalesOrderRoot } from '../models/packing-sales-order';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class PackingService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { 
    this.baseUrl = configService.sys_parameter.apiUrl;
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
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePacking/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePacking/staticLov");
  }

  getObjectList() {
    return this.http.get<GoodsPackingList[]>(this.baseUrl + "MobilePacking/gpList");
  }

  getObjectListByDate(startDate: Date, endDate: Date) {
    return this.http.get<GoodsPackingList[]>(this.baseUrl + "MobilePacking/listing/" + format(startDate, 'yyyy-MM-dd') + "/" + format(endDate, 'yyyy-MM-dd'));
  }

  getObjectById(objectId: number) {
    return this.http.get<any>(this.baseUrl + "MobilePacking/" + objectId);
  }

  getSoByCustomer(customerId: number) {
    return this.http.get<PackingSalesOrderRoot[]>(this.baseUrl + "MobilePacking/fromSO/customer/" + customerId);
  }

  getSoByCustomerLocation(customerId: number, toLocationId: number){
    return this.http.get<PackingSalesOrderRoot[]>(this.baseUrl + "MobilePacking/fromSo/customer/" + customerId + "/" + toLocationId);
  }

  insertPacking(object: GoodsPackingRoot) {
    return this.http.post(this.baseUrl + "MobilePacking", object, httpObserveHeader);
  }

  getItemInfoByBarcode(barcode: string) {
    return this.http.get<ItemBarcodeModel>(this.baseUrl + "MobilePacking/item/" + barcode);
  }
  
}
