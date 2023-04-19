import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { Customer } from '../../transactions/models/customer';
import { DebtorOutstanding, DebtorOutstandingRequest } from '../models/debtor-outstanding';
import { SAPerformanceListing, SalesAgentAllPerformanceObject } from '../models/rp-sa-performance-listing';
import { ReportSOListing } from '../models/rp-so-listing';
import { SalesByCustomer, SalesByCustomerRequest } from '../models/rp-sales-customer';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { CheckQohRoot } from '../models/rp-check-qoh';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  baseUrl: string;
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getCustomers() {
    return this.http.get<Customer[]>(this.baseUrl + "mobileReport/customer");
  }

  getDebtorOutstanding(object: DebtorOutstandingRequest) {
    return this.http.post<DebtorOutstanding[]>(this.baseUrl + "mobileReport/lastOutstanding", object);
  }

  getSOListing() {
    return this.http.get<ReportSOListing[]>(this.baseUrl + "MobileReport/soListing");
  }

  getSAPerformance() {
    return this.http.get<SAPerformanceListing[]>(this.baseUrl + "MobileReport/saPerformance");
  }

  getAllSalesPerformance(dateStart: string, dateEnd: string) {
    return this.http.get<SalesAgentAllPerformanceObject[]>(this.baseUrl + "MobileReport/allPerformance/" + dateStart + "/" + dateEnd);
  }

  getSalesByCustomer(object: SalesByCustomerRequest) {
    return this.http.post<SalesByCustomer[]>(this.baseUrl + "MobileReport/salesByCustomer", object);
  }

  getCheckQoh(search: string, loginUserType: string, salesAgentId: number) {
    return this.http.get<CheckQohRoot[]>(this.baseUrl + "mobileReport/checkQoh/" + search + "/" + loginUserType + "/" + salesAgentId);
  }

  getPdf(model: ReportParameterModel) {
    return this.http.post(this.baseUrl + "mobileReport/exportPdf", model, { responseType: 'blob' });
  }

  getCreditInfo(customerId: number) {
    return this.http.get<CreditInfo>(this.baseUrl + "mobileReport/creditInfo/" + customerId);
  }
  
}
