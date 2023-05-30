import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { Dashboard } from '../models/dashboard';
import { NotificationHistory } from '../models/notification-history';
import { TransactionProcessingCount } from 'src/app/shared/models/transaction-processing';
import { QuotationList } from '../../transactions/models/quotation';
import { SalesOrderList } from '../../transactions/models/sales-order';

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

  getQuotationReviewCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobileQuotationReviewCount").toPromise();
  }

  getQuotationApproveCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobileQuotationApproveCount").toPromise();
  }

  getSalesOrderReviewCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobileSalesOrderReviewCount").toPromise();
  }

  getSalesOrderApproveCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobileSalesOrderApproveCount").toPromise();
  }

  getPurchaseReqReviewCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobilePurchaseReqReviewCount").toPromise();
  }

  getPurchaseReqApproveCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobilePurchaseReqApproveCount").toPromise();
  }

  getPurchaseOrderReviewCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobilePurchaseOrderReviewCount").toPromise();
  }

  getPurchaseOrderApproveCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + "account/mobilePurchaseOrderApproveCount").toPromise();
  }

  getQuotationList() {
    return this.http.get<QuotationList[]>(this.configService.selected_sys_param.apiUrl + "account/mobileQuotationList").toPromise();
  }

  getSalesOrderList() {
    return this.http.get<SalesOrderList[]>(this.configService.selected_sys_param.apiUrl + "account/mobileSalesOrderList").toPromise();
  }

  downloadFiles(fileId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "account/dashboard/file/" + fileId, { responseType: 'blob' });
  }

  loadNotificationHistory() {
    return this.http.get<NotificationHistory[]>(this.configService.selected_sys_param.apiUrl + "account/notificationHistory");
  }
  
}
