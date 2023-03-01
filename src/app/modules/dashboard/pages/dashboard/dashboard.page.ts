import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LoadingController, NavController, ViewDidEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { AnnouncementFile, Dashboard, Memo, MemoDetail } from '../../models/dashboard';
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
  providers: [File, FileOpener, AndroidPermissions]
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
    private dashboardService: DashboardService,
    private navController: NavController,
    private loadingController: LoadingController,
    private opener: FileOpener,
    private file: File,
    private androidPermissions: AndroidPermissions
  ) { }

  ionViewDidEnter(): void {
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
    console.log("🚀 ~ file: dashboard.page.ts:131 ~ DashboardPage ~ downloadPdf ~ Capacitor.getPlatform():", Capacitor.getPlatform())
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Downloading...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    if (memoDetail) {
      let filename = memoDetail.filesName + memoDetail.filesType;
      try {
        this.dashboardService.downloadFiles(memoDetail.filesId).subscribe(response => {
          if (Capacitor.getPlatform() === 'android') {
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
              async result => {
                if (!result.hasPermission) {
                  this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                    async result => {
                      await loading.present();
                      this.file.writeFile(this.file.externalRootDirectory + "/Download", filename, response, { replace: true }).then(() => {
                        this.opener.open(this.file.externalRootDirectory + "/Download/" + filename, "application/pdf");
                        loading.dismiss();
                      }).catch((Error) => {
                        loading.dismiss();
                      });
                    }
                  );
                } else {
                  await loading.present();
                  this.file.writeFile(this.file.externalRootDirectory + "/Download", filename, response, { replace: true }).then(() => {
                    this.opener.open(this.file.externalRootDirectory + "/Download/" + filename, "application/pdf");
                    loading.dismiss();
                  }).catch((Error) => {
                    loading.dismiss();
                  });
                }
              }
            )
          } else if (Capacitor.getPlatform() === 'ios') {
            this.file.writeFile(this.file.tempDirectory, filename, response, { replace: true }).then(() => {
              this.opener.open(this.file.tempDirectory + filename, "application/pdf");
              loading.dismiss();
            }).catch((error) => {
              loading.dismiss();
            })
          } else {
            const url = window.URL.createObjectURL(response);
            const link = window.document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            window.document.body.appendChild(link);
            link.click();
            link.remove();
          }
        }, error => {
          loading.dismiss();
          console.log(error);
        })
      } catch(error) {
        loading.dismiss();
      }
    }
  }

}
