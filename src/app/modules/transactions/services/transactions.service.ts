import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { Customer } from '../models/customer';
import { Item, ItemImage } from '../models/item';
import { QuotationList } from '../models/quotation';
import { SalesOrderList } from '../models/sales-order';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  baseUrl: string;
  startDate: Date;
  endDate: Date

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
    if (!this.startDate) {
      this.startDate = this.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.getTodayDate();
    }
  }

  getFirstDayOfTodayMonth(): Date {
    let today = this.getTodayDate();
    let firstDom = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0);
    firstDom.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return firstDom;
  }

  getTodayDate(): Date {
    let today = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0);
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today;
  }

  /* #region  quotation */
  

  /* #endregion */

  /* #region  sales order */

  //getSalesOrderRecentList() {
  //  return this.http.get<SalesOrderList[]>(this.baseUrl + "mobileSalesOrder/recentListing");
  //}

  //getSalesOrderList() {
  //  return this.http.get<SalesOrderList[]>(this.baseUrl + "mobileSalesOrder/listing/" + format(parseISO(this.startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(this.endDate.toISOString()), 'yyyy-MM-dd'));
  //}

  /* #endregion */

}
