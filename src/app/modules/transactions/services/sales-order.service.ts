import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { Customer } from '../models/customer';
import { SalesOrderHeader, SalesOrderList, SalesOrderRoot, SalesOrderSummary } from '../models/sales-order';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  /* #region  for insert */

  header: SalesOrderHeader;
  itemInCart: TransactionDetail[] = [];
  salesOrderSummary: SalesOrderSummary;
  setHeader(header: SalesOrderHeader) {
    this.header = header;
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setSalesOrderSummary(ss: SalesOrderSummary) {
    this.salesOrderSummary = ss;
  }

  removeCustomer() {
    this.header = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeSummary() {
    this.salesOrderSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeItems();
    this.removeSummary();
  }

  hasSalesAgent(): boolean {
    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
      return false;
    }
    return true
  }

  /* #endregion */

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileSalesOrder/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileSalesOrder/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobileSalesOrder/customer");
  }
  
  getPromotion(trxDate: string) {
    return this.http.get<PromotionMaster[]>(this.baseUrl + 'MobileSalesOrder/promotion/' + trxDate);
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + "MobileSalesOrder/item/itemList", { context: background_load() });
  }

  getObjectList() {
    return this.http.get<SalesOrderList[]>(this.baseUrl + "MobileSalesOrder/solist");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<SalesOrderList[]>(this.baseUrl + "MobileSalesOrder/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<SalesOrderRoot>(this.baseUrl + "MobileSalesOrder/" + objectId);
  }

  insertObject(object: SalesOrderRoot) {
    return this.http.post(this.baseUrl + "MobileSalesOrder", object, httpObserveHeader);
  }

}
