import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { Dashboard } from '../models/dashboard';
import { NotificationHistory } from '../models/notification-history';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {  
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {

  }

  getDashboard() {
    return this.http.get<Dashboard>(this.configService.selected_sys_param.apiUrl + 'account/mobileDashboard')
  }

  downloadFiles(fileId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "account/dashboard/file/" + fileId, { responseType: 'blob' });
  }

  loadNotificationHistory() {
    return this.http.get<NotificationHistory[]>(this.configService.selected_sys_param.apiUrl + "account/notificationHistory");
  }
  
}
