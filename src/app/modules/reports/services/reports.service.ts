import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { DebtorOutStanding } from '../models/debtor-outstanding';

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

  getDebtorOutstanding() {
    return this.http.get<DebtorOutStanding[]>(this.baseUrl + "mobileReport/lastOutstanding/debtor");
  }
  
}
