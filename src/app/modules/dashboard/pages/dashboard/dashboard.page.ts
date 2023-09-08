import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, NavController, ViewDidEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Dashboard, Memo, MemoDetail } from '../../models/dashboard';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationHistory } from '../../models/notification-history';
import { approvalAppCode, moduleCode, trxAppCode } from 'src/app/shared/models/acl-const';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit, ViewDidEnter {

  showQuotationReview: boolean = false;
  showQuotationApproval: boolean = false;

  showSalesOrderReview: boolean = false;
  showSalesOrderApproval: boolean = false;

  showBackToBackOrderReview: boolean = false;
  showBackToBackOrderApproval: boolean = false;

  showPurchaseReqReview: boolean = false;
  showPurchaseReqApproval: boolean = false;

  showPurchaseOrderReview: boolean = false;
  showPurchaseOrderApproval: boolean = false;

  showSalesOrderPricingApproval: boolean = false;

  showBackToBackOrderPricingApproval: boolean = false;
  
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

  ionViewDidEnter(): void {
    try {
      this.last_sync_datetime = this.configService.selected_sys_param.lastDownloadAt;
      this.loadAnnouncements();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    try {
      this.authService.menuModel$.subscribe(obj => {
        if (obj) {
          let mPageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.approval);
          console.log("🚀 ~ file: dashboard.page.ts:68 ~ DashboardPage ~ ngOnInit ~ mPageItems:", mPageItems)
          if (mPageItems) {
            this.showQuotationReview = mPageItems.findIndex(r => r.title === approvalAppCode.quotationRV) > -1;
            this.showQuotationApproval = mPageItems.findIndex(r => r.title === approvalAppCode.quotationAP) > -1;
            this.showSalesOrderReview = mPageItems.findIndex(r => r.title === approvalAppCode.salesOrderRV) > -1;
            this.showSalesOrderApproval = mPageItems.findIndex(r => r.title === approvalAppCode.salesOrderAP) > -1;

            this.showBackToBackOrderReview = mPageItems.findIndex(r => r.title === approvalAppCode.b2bOrderRV) > -1;
            this.showBackToBackOrderApproval = mPageItems.findIndex(r => r.title === approvalAppCode.b2bOrderAP) > -1;

            this.showPurchaseReqReview = mPageItems.findIndex(r => r.title === approvalAppCode.purchaseReqRV) > -1;
            this.showPurchaseReqApproval = mPageItems.findIndex(r => r.title === approvalAppCode.purchaseReqAP) > -1;
            this.showPurchaseOrderReview = mPageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderRV) > -1;
            this.showPurchaseOrderApproval = mPageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderAP) > -1;
            this.showSalesOrderPricingApproval = mPageItems.findIndex(r => r.title === approvalAppCode.salesOrderPricingAP) > -1;
            console.log("🚀 ~ file: dashboard.page.ts:83 ~ DashboardPage ~ ngOnInit ~ this.showSalesOrderPricingApproval:", this.showSalesOrderPricingApproval)
            this.showBackToBackOrderPricingApproval = mPageItems.findIndex(r => r.title === approvalAppCode.b2bOrderPricingAP) > -1;
            console.log("🚀 ~ file: dashboard.page.ts:85 ~ DashboardPage ~ ngOnInit ~ this.showBackToBackOrderPricingApproval:", this.showBackToBackOrderPricingApproval)
          }

          let tPageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.transaction);
          if (tPageItems) {
            this.showQuotation = tPageItems.findIndex(r => r.title === trxAppCode.mobileQuotation) > -1;
            this.showSalesOrder = tPageItems.findIndex(r => r.title === trxAppCode.mobileSalesOrder) > -1;
          }
        }
      })
      this.loadAnnouncements();
    } catch (e) {
      console.error(e);
    }
  }

  dashboardData: Dashboard;
  loadAnnouncements() {
    try {
      this.dashboardService.getDashboard().subscribe(response => {
        this.dashboardData = response;
        console.log("🚀 ~ file: dashboard.page.ts:104 ~ DashboardPage ~ this.dashboardService.getDashboard ~ this.dashboardData:", this.dashboardData)
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  goToManagement(page: string, mode: string) {
    try {
      if (page && mode) {
        this.navController.navigateRoot(`/managements/${page}-${mode}`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  goToTransaction(page: string) {
    try {
      if (page) {
        this.navController.navigateRoot(`/transactions/${page}`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  isModalOpen: boolean = false;
  selectedAnnouncement: Memo;
  showModal(memo: Memo) {
    try {
      this.selectedAnnouncement = memo;
      this.isModalOpen = true;      
    } catch (e) {
      console.error(e);
    }
  }

  hideModal() {
    try {
      this.isModalOpen = false;
      this.selectedAnnouncement = null;
    } catch (e) {
      console.error(e);
    }
  }

  async downloadPdf(memoDetail: MemoDetail) {
    try {
      if (memoDetail) {
        let filename = memoDetail.filesName + memoDetail.filesType;
        this.dashboardService.downloadFiles(memoDetail.filesId).subscribe(async response => {
          await this.commonService.commonDownloadPdf(response, filename);
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region history modal */

  notificationHistoryModal: boolean = false;
  notificationHistories: NotificationHistory[] = [];
  async showNotificationHistoryModal() {
    try {
      await this.dashboardService.loadNotificationHistory().subscribe(response => {
        this.notificationHistories = response;
        this.notificationHistoryModal = true;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  hideNotificationHistoryModal() {
    try {
      this.notificationHistoryModal = false;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  badgeNumber: Number;
  async setBadges() {
    try {
      // let hasPermission = await this.badge.hasPermission();
      // if (!hasPermission) {
      //   let permissions = await this.badge.requestPermission();
      // } else {
      //   this.badge.set(Number(this.badgeNumber));
      // }
    } catch (e) {
      console.error(e);
    }
  }

}
