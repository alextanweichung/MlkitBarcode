import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { OtherSalesDetail, OtherSalesHeader, OtherSalesList, OtherSalesRoot } from '../models/other-sales';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class OtherSalesService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { 
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  otherSalesHeader: OtherSalesHeader;
  setHeader(header: OtherSalesHeader) {
    this.otherSalesHeader = header;
  }

  otherSalesDetails: OtherSalesDetail[] = [];
  setDetails(details: OtherSalesDetail[]) {
    this.otherSalesDetails = details;
  }

  removeHeader() {
    this.otherSalesHeader = null;
  }

  removeDetails() {
    this.otherSalesDetails = [];
  }

  resetVariables() {
    this.removeHeader();
    this.removeDetails();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileOtherSales/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileOtherSales/staticlov");
  }

  getOtherSalesListByDate(startDate: Date, endDate: Date) {
    return this.http.get<OtherSalesList[]>(this.baseUrl + "MobileOtherSales/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  }

  getRecentOtherSalesList() {
    return this.http.get<OtherSalesList[]>(this.baseUrl + "MobileOtherSales/recentListing");
  }

  getOtherSales(otherSalesId: number) {
    return this.http.get<OtherSalesRoot>(this.baseUrl + "MobileOtherSales/" + otherSalesId);
  }


}
