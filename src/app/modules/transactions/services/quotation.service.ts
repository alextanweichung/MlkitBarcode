import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { Customer } from '../models/customer';
import { Item, ItemImage } from '../models/item';
import { QuotationHeader, QuotationList, QuotationRoot } from '../models/quotation';

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
  itemInCart: Item[] = [];
  // quotationSummary: QuotationSummary;
  setHeader(header: QuotationHeader) {
    this.header = header;
  }

  setChoosenItems(item: Item[]) {
    this.itemInCart = JSON.parse(JSON.stringify(item));
  }

  setQuotationSummary(qs: any) {
    // this.quotationSummary = qs;
  }

  removeCustomer() {
    this.header = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeSummary() {
    // this.quotationSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeItems();
    this.removeSummary();
  }

  hasSalesAgent():boolean {
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

  // getItemList(keyword: string, customerId: number, locationId: number) {
  //   return this.http.get<Item[]>(this.baseUrl + "MobileQuotation/item/itemList/" + keyword + "/" + customerId + "/" + locationId, { context: background_load() }).pipe(
  //     map((response: any) =>
  //       response.map((item: any) => item)
  //     )
  //   );
  // }

  // getItemListWithTax(keyword: string, trxDate: string, customerId: number, locationId: number) {
  //   return this.http.get<Item[]>(this.baseUrl + "MobileQuotation/item/itemListWithTax/" + keyword + "/" + trxDate + "/" + customerId + "/" + locationId, { context: background_load() });
  // }

  // getItemImageFile(keyword: string) {
  //   return this.http.get<ItemImage[]>(this.baseUrl + "MobileQuotation/itemList/imageFile/" + keyword, { context: background_load() });
  // }

  // getObjectList(startDate: Date, endDate: Date) {
  //   return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  // }

  getObjectList() {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/qtlist");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<QuotationRoot>(this.baseUrl + "MobileQuotation/" + objectId);
  }

  // getQuotationDetail(objectId: number) {
  //   return this.http.get<QuotationRoot>(this.baseUrl + "MobileQuotation/" + objectId);
  // }

  // insertQuotation(object: QuotationRoot) {
  //   return this.http.post(this.baseUrl + "MobileQuotation", object, httpObserveHeader);
  // }

}
