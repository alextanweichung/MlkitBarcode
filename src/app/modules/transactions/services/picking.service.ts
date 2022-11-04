import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { GoodsPicking, GoodsPickingDto, PickingList, PickingRoot, PickingSummary } from '../models/picking';
import { PickingSalesOrderDetail, PickingSalesOrderRoot } from '../models/picking-sales-order';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class PickingService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  pickingDtoHeader: GoodsPicking;
  setHeader(pickingDtoHeader: GoodsPicking) {
    this.pickingDtoHeader = pickingDtoHeader;
  }

  selectedSalesOrders: PickingSalesOrderRoot[] = [];
  setChoosenSalesOrders(psos: PickingSalesOrderRoot[]) {
    this.selectedSalesOrders = psos;
  }

  selectedSalesOrderLines: PickingSalesOrderDetail[] = [];
  setChooseSalesOrderLines(soLines: PickingSalesOrderDetail[]) {
    this.selectedSalesOrderLines = soLines;
  }

  pickingSummary: PickingSummary;
  setPickingSummary(pickingSummary: PickingSummary) {
    this.pickingSummary = pickingSummary;
  }

  removeCustomer() {
    this.pickingDtoHeader = null;
  }

  removeSalesOrders() {
    this.selectedSalesOrders = [];
  }

  removeSalesOrderLines() {
    this.selectedSalesOrderLines = [];
  }

  removePickingSummary() {
    this.pickingSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeSalesOrders();
    this.removeSalesOrderLines();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePicking/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePicking/staticLov");
  }

  getSoByCustomer(customerId: number) {
    return this.http.get<PickingSalesOrderRoot[]>(this.baseUrl + "MobilePicking/fromSO/customer/" + customerId);
  }

  getSoByCustomerLocation(customerId: number, toLocationId: number){
    return this.http.get<PickingSalesOrderRoot[]>(this.baseUrl + "MobilePicking/fromSo/customer/" + customerId + "/" + toLocationId);
  }

  getPickingList(startDate: Date, endDate: Date) {
    return this.http.get<PickingList[]>(this.baseUrl + "MobilePicking/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  }

  getRecentPickingList() {
    return this.http.get<PickingList[]>(this.baseUrl + "MobilePicking/recentListing");
  }

  getPickingDetail(pickingId: number) {
    return this.http.get<PickingRoot>(this.baseUrl + "MobilePicking/" + pickingId);
  }

  insertPicking(object: GoodsPickingDto) {
    return this.http.post(this.baseUrl + "MobilePicking", object, httpObserveHeader);
  }

}
