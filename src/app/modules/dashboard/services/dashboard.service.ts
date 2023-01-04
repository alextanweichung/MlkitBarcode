import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { Dashboard } from '../models/dashboard';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  baseUrl: string;
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getDashboard() {
    return this.http.get<Dashboard>(this.baseUrl + 'account/mobileDashboard')
  }

  downloadFiles(fileId: number) {
    return this.http.get(this.baseUrl + "account/dashboard/file/" + fileId, { responseType: 'blob' });
  }
  
}
