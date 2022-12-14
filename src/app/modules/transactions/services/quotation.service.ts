import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { Customer } from '../models/customer';
import { Item, ItemImage } from '../models/item';
import { QuotationHeader, QuotationList, QuotationRoot, QuotationSummary } from '../models/quotation';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  /* #region  for insert */

  header: QuotationHeader;
  itemInCart: TransactionDetail[] = [];
  quotationSummary: QuotationSummary;
  setHeader(header: QuotationHeader) {
    this.header = header;
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setQuotationSummary(qs: QuotationSummary) {
    this.quotationSummary = qs;
  }

  removeCustomer() {
    this.header = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeSummary() {
    this.quotationSummary = null;
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
    return this.http.get<MasterList[]>(this.baseUrl + "MobileQuotation/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileQuotation/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobileQuotation/customer");
  }
  
  getPromotion(trxDate: string) {
    return this.http.get<PromotionMaster[]>(this.baseUrl + 'MobileQuotation/promotion/' + trxDate);
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + "MobileQuotation/item/itemList", { context: background_load() });
  }

  getObjectList() {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/qtlist");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<QuotationRoot>(this.baseUrl + "MobileQuotation/" + objectId);
  }

  insertObject(object: QuotationRoot) {
    return this.http.post(this.baseUrl + "MobileQuotation", object, httpObserveHeader);
  }

}
