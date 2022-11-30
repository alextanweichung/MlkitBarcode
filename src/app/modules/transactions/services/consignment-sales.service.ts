import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConsignmentSalesHeader } from '../models/consignment-sales';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class ConsignmentSalesService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { 
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  header: ConsignmentSalesHeader;
  setHeader(header: ConsignmentSalesHeader) {
    this.header = header;
    console.log("🚀 ~ file: consignment-sales.service.ts ~ line 29 ~ ConsignmentSalesService ~ setHeader ~ this.header", this.header)
  }

  // otherSalesDetails: OtherSalesDetail[] = [];
  // setDetails(details: OtherSalesDetail[]) {
  //   this.otherSalesDetails = details;
  // }

  removeHeader() {
    this.header = null;
  }

  removeDetails() {
    // this.otherSalesDetails = [];
  }

  resetVariables() {
    this.removeHeader();
    this.removeDetails();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileConsignmentSales/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileConsignmentSales/staticlov");
  }

  getObjectList() {
    return this.http.get(this.baseUrl + "MobileConsignmentSales/cslist");
  }

}
