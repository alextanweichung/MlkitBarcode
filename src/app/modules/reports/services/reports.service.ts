import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { Customer } from '../../transactions/models/customer';
import { DebtorOutstanding } from '../models/debtor-outstanding';
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

  getDebtorOutstanding(customerId: number, trxDate: string) {
    return this.http.get<DebtorOutstanding[]>(this.baseUrl + "mobileReport/lastOutstanding/debtor/" + customerId.toString() + "/" + trxDate);
  }

  getSOListing() {
    return this.http.get<ReportSOListing[]>(this.baseUrl + "MobileReport/soListing");
  }

  getPdf(model: ReportParameterModel) {
    return this.http.post(this.baseUrl + "mobileReport/exportPdf", model, { responseType: 'blob' });
  }
  
}
