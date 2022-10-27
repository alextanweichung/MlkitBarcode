import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PickingList, PickingRoot } from '../models/picking';
import { PickingSalesOrderRoot } from '../models/picking-sales-order';

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

  selectedCustomer: MasterListDetails;
  setChoosenCustomer(customer: MasterListDetails) {
    this.selectedCustomer = customer;
  }

  selectedSalesOrder: PickingSalesOrderRoot
  setChoosenSalesOrder(pso: PickingSalesOrderRoot) {
    this.selectedSalesOrder = pso;
  }

  removeCustomer() {
    this.selectedCustomer = null;
  }

  removeSalesOrder() {
    this.selectedSalesOrder = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeSalesOrder();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePicking/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePicking/staticLov");
  }

  getSalesOrders(customerId: number) {
    return this.http.get<PickingSalesOrderRoot[]>(this.baseUrl + "MobilePicking/fromSO/customer/" + customerId);
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

}
