import { Component, OnInit, ViewChild } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Dashboard, Memo, MemoDetail } from '../../models/dashboard';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationHistory } from '../../models/notification-history';

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
  providers: [File, FileOpener, AndroidPermissions]
})
export class DashboardPage implements OnInit, ViewWillEnter {

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
    private commonService: CommonService,
    private configService: ConfigService,
    private dashboardService: DashboardService,
    private navController: NavController
  ) { }

  ionViewWillEnter(): void {
    this.last_sync_datetime = this.configService.sys_parameter.lastDownloadAt;
    this.loadAnnouncements();
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

  goToManagement(page: string, mode: string) {
    if (page && mode) {
      this.navController.navigateRoot(`/managements/${page}-${mode}`);
    }
  }

  goToTransaction(page: string) {
    if (page) {
      this.navController.navigateRoot(`/transactions/${page}`);
    }
  }

  isModalOpen: boolean = false;
  selectedAnnouncement: Memo;
  showModal(memo: Memo) {
    this.selectedAnnouncement = memo;
    this.isModalOpen = true;
  }

  hideModal() {
    this.isModalOpen = false;
    this.selectedAnnouncement = null;
  }

  async downloadPdf(memoDetail: MemoDetail) {
    if (memoDetail) {
      let filename = memoDetail.filesName + memoDetail.filesType;
      try {
        this.dashboardService.downloadFiles(memoDetail.filesId).subscribe(async response => {
          await this.commonService.commonDownloadPdf(response, filename);
        }, error => {
          console.log(error);
        })
      } catch (error) {
        console.log(error);
      }
    }
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    this.popoverMenu.event = event;
    this.isPopoverOpen = true;
  }

  /* #endregion */

  /* #region history modal */

  notificationHistoryModal: boolean = false;
  notificationHistories: NotificationHistory[] = [];
  showNotificationHistoryModal() {
    this.dashboardService.loadNotificationHistory().subscribe(response => {
      this.notificationHistories = response;
      this.notificationHistoryModal = true;
    }, error => {
      console.log(error);
    })
  }

  hideNotificationHistoryModal() {
    this.notificationHistoryModal = false;
  }

  /* #endregion */

}
