import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Dashboard, Memo, MemoDetail } from '../../models/dashboard';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationHistory } from '../../models/notification-history';
import { approvalAppCode, moduleCode, trxAppCode } from 'src/app/shared/models/acl-const';
import { LoginUser } from 'src/app/services/auth/login-user';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { ConsignmentSalesLocation } from 'src/app/modules/transactions/models/consignment-sales';
import { Capacitor } from '@capacitor/core';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { LocalItemBarcode, LocalItemMaster, LocalMarginConfig } from 'src/app/shared/models/pos-download';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit, ViewWillEnter, ViewDidEnter {

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

  showNonTradePurchaseReqReview: boolean = false;
  showNonTradePurchaseReqApproval: boolean = false;

  showNonTradePurchaseOrderReview: boolean = false;
  showNonTradePurchaseOrderApproval: boolean = false;

  last_sync_datetime: Date;

  showQuotation: boolean = false;
  showSalesOrder: boolean = false;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    public consignmentSalesService: ConsignmentSalesService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private configService: ConfigService,
    private dashboardService: DashboardService,
    private navController: NavController
  ) { }
  
  ionViewWillEnter(): void {
    this.loginUser = JSON.parse(localStorage.getItem("loginUser")) as LoginUser;
    if (this.loginUser.loginUserType === "C") {
      this.consignmentSalesService.loadRequiredMaster();
    }
    this.last_sync_datetime = this.configService.selected_sys_param.lastDownloadAt;
  }

  ionViewDidEnter(): void {
    if (this.loginUser.loginUserType === "C" && !this.configService.selected_consignment_location) {
      if ( this.loginUser.locationId && this.loginUser.locationId.length === 0) {
        // show error if consignment user but no location set
        this.toastService.presentToast("", "Consignment Location not set", "top", "warning", 1000);
      }
      if (this.loginUser.locationId && this.loginUser.locationId.length > 1) {
        this.showLocationModal();
      }
    }
    this.last_sync_datetime = this.configService.selected_sys_param.lastDownloadAt;
  }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      if (obj) {
        let mPageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.approval);
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

          this.showNonTradePurchaseReqReview = mPageItems.findIndex(r => r.title === approvalAppCode.nonTradePRRV) > -1;
          this.showNonTradePurchaseReqApproval = mPageItems.findIndex(r => r.title === approvalAppCode.nonTradePRAP) > -1;

          this.showNonTradePurchaseOrderReview = mPageItems.findIndex(r => r.title === approvalAppCode.nonTradePORV) > -1;
          this.showNonTradePurchaseOrderApproval = mPageItems.findIndex(r => r.title === approvalAppCode.nonTradePOAP) > -1;
          this.showSalesOrderPricingApproval = mPageItems.findIndex(r => r.title === approvalAppCode.salesOrderPricingAP) > -1;
          this.showBackToBackOrderPricingApproval = mPageItems.findIndex(r => r.title === approvalAppCode.b2bOrderPricingAP) > -1;
        }

        let tPageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.transaction);
        if (tPageItems) {
          this.showQuotation = tPageItems.findIndex(r => r.title === trxAppCode.mobileQuotation) > -1;
          this.showSalesOrder = tPageItems.findIndex(r => r.title === trxAppCode.mobileSalesOrder) > -1;
        }
      }
    })
    this.loadAnnouncements();
  }

  dashboardData: Dashboard;
  loadAnnouncements() {
    try {
      this.dashboardService.getDashboard().subscribe(response => {
        this.dashboardData = response;
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region choose default location for consignment user */

  async chooseDefaultLocation() {
    let loginUser = JSON.parse(localStorage.getItem("loginUser")) as LoginUser;
    if (loginUser.loginUserType === "C" && loginUser.locationId && loginUser.locationId.length > 1 && !this.configService.selected_consignment_location) {

    }
  }

  /* #endregion */

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
          console.error(error);;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
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
        console.error(error);
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

  /* #region select location modal */

  loginUser: LoginUser;
  selectLocationModal: boolean = false;
  showLocationModal() {
    this.selectLocationModal = true;
  }

  hideLocationModal() {
    this.selectLocationModal = false;
  }

  async setDefaultConsignmentLocation(location: ConsignmentSalesLocation) {
    this.configService.selected_consignment_location = location.locationId;
    this.hideLocationModal();
    if (Capacitor.getPlatform() !== "web") {
      try {
        await this.loadingService.showLoading("Downloading resources");
        let response = await this.commonService.syncInboundConsignment(this.configService.selected_consignment_location, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
        let itemMaster: LocalItemMaster[] = response["itemMaster"];
        let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
        await this.configService.syncInboundData(itemMaster, itemBarcode);

        let response2 = await this.commonService.syncMarginConfig(this.configService.selected_consignment_location);
        let marginConfig: LocalMarginConfig[] = response2;
        await this.configService.syncMarginConfig(marginConfig);

        await this.loadingService.dismissLoading();
      } catch (e) {
        await this.loadingService.dismissLoading();
        console.error(e);
      } finally {
        await this.loadingService.dismissLoading();
      }
    }
  }

  /* #endregion */

}
