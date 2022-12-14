import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { ConsignmentSalesHeader, ConsignmentSalesList, ConsignmentSalesRoot, ConsignmentSalesSummary } from '../models/consignment-sales';

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

  summary: ConsignmentSalesSummary;
  setSummary(summary: ConsignmentSalesSummary) {
    this.summary = summary;
  }

  removeHeader() {
    this.header = null;
  }

  removeSummary() {
    this.summary = null;
  }

  resetVariables() {
    this.removeHeader();
    this.removeSummary();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileOtherSales/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileOtherSales/staticlov");
  }

  getObjectList() {
    return this.http.get<ConsignmentSalesList[]>(this.baseUrl + "MobileOtherSales/cslist");
  }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<ConsignmentSalesList[]>(this.baseUrl + "MobileOtherSales/listing/" + startDate + "/" + endDate);
  }  

  getObjectById(objectId: number) {
    return this.http.get<ConsignmentSalesRoot>(this.baseUrl + "MobileOtherSales/" + objectId);
  }

  getExistingObject(trxDate: string, toLocationId: number) {
    return this.http.get<ConsignmentSalesRoot>(this.baseUrl + "MobileOtherSales/existing/" + trxDate + "/" + toLocationId);
  }

  insertObject(object: ConsignmentSalesRoot) {
    return this.http.post(this.baseUrl + "MobileOtherSales", object, httpObserveHeader);
  }

  updateObject(object: ConsignmentSalesRoot) {
    return this.http.put(this.baseUrl + "MobileOtherSales", object, httpObserveHeader);
  }

}
