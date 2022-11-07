import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { GoodsPacking, PackingList, PackingSummary } from '../models/packing';
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

  packingDtoHeader: GoodsPacking;
  setHeader(packingDtoHeader: GoodsPacking) {
    this.packingDtoHeader = packingDtoHeader;
  }

  selectedSalesOrders: PackingSalesOrderRoot[] = [];
  setChoosenSalesOrders(psos: PackingSalesOrderRoot[]) {
    this.selectedSalesOrders = psos;
  }

  selectedSalesOrderLines: PackingSalesOrderDetail[] = [];
  setChooseSalesOrderLines(soLines: PackingSalesOrderDetail[]) {
    this.selectedSalesOrderLines = soLines;
  }

  packingSummary: PackingSummary;
  setPackingSummary(packingSummary: PackingSummary) {
    this.packingSummary = packingSummary;
  }

  removeCustomer() {
    this.packingDtoHeader = null;
  }

  removeSalesOrders() {
    this.selectedSalesOrders = [];
  }

  removeSalesOrderLines() {
    this.selectedSalesOrderLines = [];
  }

  removePackingSummary() {
    this.packingSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeSalesOrders();
    this.removeSalesOrderLines();
    this.removePackingSummary();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePacking/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePacking/staticLov");
  }

  getSoByCustomer(customerId: number) {
    return this.http.get<PackingSalesOrderRoot[]>(this.baseUrl + "MobilePacking/fromSO/customer/" + customerId);
  }

  getSoByCustomerLocation(customerId: number, toLocationId: number){
    return this.http.get<PackingSalesOrderRoot[]>(this.baseUrl + "MobilePacking/fromSo/customer/" + customerId + "/" + toLocationId);
  }

  getPackingList(startDate: Date, endDate: Date) {
    return this.http.get<PackingList[]>(this.baseUrl + "MobilePacking/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  }

  getRecentPackingList() {
    return this.http.get<PackingList[]>(this.baseUrl + "MobilePacking/recentListing");
  }

  getPackingDetail(packingId: number) {
    return this.http.get<any>(this.baseUrl + "MobilePacking/" + packingId);
  }
  
}
