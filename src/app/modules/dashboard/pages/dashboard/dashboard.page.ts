import { Component, OnInit } from '@angular/core';
import { ViewDidEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { AnnouncementFile, Dashboard } from '../../models/dashboard';
import { DashboardService } from '../../services/dashboard.service';

const managementPageCode: string = 'MAAP';
const quotationReviewCode: string = 'MAQURV';
const quotationApprovalCode: string = 'MAQUAP';
const salesOrderReviewCode: string = 'MASORV';
const salesOrderApprovalCode: string = 'MASOAP';
const purchaseOrderReviewCode: string = 'MAPORV';
const purchaseOrderApprovalCode: string = 'MAPOAP';

const transactionPageCode: string = 'MATR';
const mobileQuotationCode: string = 'MATRQU';
const mobileSalesOrderCode: string = 'MATRSO';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, ViewDidEnter {

  showQuotationReview: boolean = false;
  showQuotationApproval: boolean = false;

  showSalesOrderReview: boolean = false;
  showSalesOrderApproval: boolean = false;

  showPurchaseOrderReview: boolean = false;
  showPurchaseOrderApproval: boolean = false;
  
  last_sync_datetime: Date;

  showQuotation: boolean = false;
  showSalesOrder: boolean = false;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private dashboardService: DashboardService
  ) { }

  ionViewDidEnter(): void {
    this.last_sync_datetime = this.configService.sys_parameter.lastDownloadAt;
  }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let mPageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === managementPageCode);
      if (mPageItems) {
        this.showQuotationReview = mPageItems.findIndex(r => r.title === quotationReviewCode) > -1;
        this.showQuotationApproval = mPageItems.findIndex(r => r.title === quotationApprovalCode) > -1;
        this.showSalesOrderReview = mPageItems.findIndex(r => r.title === salesOrderReviewCode) > -1;
        this.showSalesOrderApproval = mPageItems.findIndex(r => r.title === salesOrderApprovalCode) > -1;
        this.showPurchaseOrderReview = mPageItems.findIndex(r => r.title === purchaseOrderReviewCode) > -1;
        this.showPurchaseOrderApproval = mPageItems.findIndex(r => r.title === purchaseOrderApprovalCode) > -1;
      }

      let tPageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === transactionPageCode);
      if (tPageItems) {
        this.showQuotation = tPageItems.findIndex(r => r.title === mobileQuotationCode) > -1;
        this.showSalesOrder = tPageItems.findIndex(r => r.title === mobileSalesOrderCode) > -1;
      }
    })
    this.loadAnnouncements();
  }

  dashboardData: Dashboard;
  loadAnnouncements() {
    this.dashboardService.getDashboard().subscribe(response => {
      this.dashboardData = response;
    }, error => {
      console.log(error);
    })
  }

  downloadFile(file: AnnouncementFile) {
    this.dashboardService.downloadFiles(file.filesId).subscribe(blob => {
      let t: any = new Blob([blob]);
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(t);
      a.href = objectUrl;
      a.download = file.filesName + file.filesType;
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.log(error);
    })
  }

}
