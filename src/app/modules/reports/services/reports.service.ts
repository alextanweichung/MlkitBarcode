import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { Customer } from '../../transactions/models/customer';
import { DebtorOutstanding, DebtorOutstandingRequest } from '../models/debtor-outstanding';
import { SAPerformaceListing } from '../models/rp-sa-performace-listing';
import { ReportSOListing } from '../models/rp-so-listing';

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
    return this.http.get<SAPerformaceListing[]>(this.baseUrl + "MobileReport/saPerformance");
  }

  getPdf(model: ReportParameterModel) {
    return this.http.post(this.baseUrl + "mobileReport/exportPdf", model, { responseType: 'blob' });
  }
  
}
