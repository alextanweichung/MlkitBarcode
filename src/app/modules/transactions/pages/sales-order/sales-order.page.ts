import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesOrderList, SalesOrderRoot } from '../../models/sales-order';
import { CommonService } from '../../../../shared/services/common.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.page.html',
  styleUrls: ['./sales-order.page.scss']
})
export class SalesOrderPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {

  private objectDiffer: any;
  objects: SalesOrderList[] = [];
  draftObjects: DraftTransaction[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];
  salesAgentIds: number[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private objectService: SalesOrderService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private navController: NavController,
    private toastService: ToastService,
    private differs: IterableDiffers
  ) {
    // reload all masterlist whenever user enter listing
    this.objectService.loadRequiredMaster();
    this.objectDiffer = this.differs.find(this.objects).create();
  }

  ngDoCheck(): void {
    const objectChanges = this.objectDiffer.diff(this.objects);
    if (objectChanges) {
      this.bindUniqueGrouping();
    }
  }

  ionViewWillEnter(): void {
    this.objectService.resetVariables();
    this.objects = []; // clear list when enter
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
  }

  ionViewDidEnter(): void {
    if (this.showDraftOnly) {
      this.loadDraftObjects();
    } else {
      this.loadObjects();
      this.loadDraftObjects();
    }
  }

  ngOnInit() {

  }

  /* #region  crud */

  async loadObjects() {
    try {
      let obj: SalesSearchModal = {
        dateStart: format(this.startDate, "yyyy-MM-dd"),
        dateEnd: format(this.endDate, "yyyy-MM-dd"),
        customerId: this.customerIds,
        salesAgentId: this.salesAgentIds
      }
      this.objectService.getObjectListByDate(obj).subscribe(async response => {
        this.objects = [...this.objects, ...response];
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, async error => {
        throw error;
      })
    } catch (error) {
      this.toastService.presentToast("", "Error loading object.", "top", "danger", 1000);
    }
  }

  loadDraftObjects() {
    try {
      this.objectService.getDraftObjects().subscribe(async response => {
        this.draftObjects = response;
        for (let index = 0; index < this.draftObjects.length; index++) {
          const element = this.draftObjects[index];
          let objRoot: SalesOrderRoot = JSON.parse(element.jsonData);
          objRoot.header = this.commonService.convertObjectAllDateType(objRoot.header);
          let obj: SalesOrderList = {
            salesOrderId: objRoot.header.salesOrderId,
            salesOrderNum: element.draftTransactionNum,
            trxDate: objRoot.header.trxDate,
            customerCode: await this.objectService.customerMasterList.find(r => r.id === objRoot.header.customerId)?.code,
            customerName: await this.objectService.customerMasterList.find(r => r.id === objRoot.header.customerId)?.description,
            salesAgentName: await this.objectService.salesAgentMasterList.find(r => r.id === objRoot.header.salesAgentId)?.description,
            countryDescription: null,
            currencyCode: await this.objectService.currencyMasterList.find(r => r.id === objRoot.header.currencyId)?.code,
            grandTotal: objRoot.details.flatMap(r => r.subTotal).reduce((a, c) => a + c, 0),
            qty: objRoot.details.flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0),
            otherAmountCount: objRoot.otherAmount?.length,
            deactivated: objRoot.header.deactivated,
            createdById: objRoot.header.createdById,
            isDraft: true,
            draftTransactionId: element.draftTransactionId
          }
          this.objects = [...this.objects, obj];
        }
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, async error => {
        throw error;
      })
    } catch (error) {
      this.toastService.presentToast("", "Error loading draft object.", "top", "danger", 1000);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
  }  

  async bindUniqueGrouping() {
    let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
    this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
    await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
  }

  /* #endregion */

  /* #region  add quotation */

  async addObject() {
    try {
      if (this.objectService.hasSalesAgent()) {
        this.navController.navigateForward("/transactions/sales-order/sales-order-header");
      } else {
        this.toastService.presentToast("System Error", "Sales Agent not set.", "top", "danger", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Choose an action",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Add Sales Order",
            icon: "document-outline",
            handler: () => {
              this.addObject();
            }
          },
          {
            text: "Cancel",
            icon: "close",
            role: "cancel"
          }]
      });
      await actionSheet.present();
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region download pdf */

  async presentAlertViewPdf(doc) {
    try {
      const alert = await this.alertController.create({
        header: "Download PDF?",
        message: "",
        buttons: [
          {
            text: "OK",
            cssClass: "success",
            role: "confirm",
            handler: async () => {
              await this.downloadPdf(doc);
            },
          },
          {
            cssClass: "cancel",
            text: "Cancel",
            role: "cancel"
          },
        ]
      });
      await alert.present();
    } catch (e) {
      console.error(e);
    }
  }

  async downloadPdf(doc) {
    try {
      this.objectService.downloadPdf("SMSC002", "pdf", doc.salesOrderId, "Proforma Invoice").subscribe(response => {
        let filename = doc.salesOrderNum + ".pdf";
        this.commonService.commonDownloadPdf(response, filename);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  showDraftOnly: boolean = false;
  async filter() {
    try {
      const modal = await this.modalController.create({
        component: FilterPage,
        componentProps: {
          startDate: this.startDate,
          endDate: this.endDate,
          customerFilter: true,
          customerList: this.objectService.customerSearchDropdownList,
          selectedCustomerId: this.customerIds,
          salesAgentFilter: true,
          salesAgentList: this.objectService.salesAgentDropdownList,
          selectedSalesAgentId: this.salesAgentIds,
          useDraft: true,
          showDraftOnly: this.showDraftOnly
        },
        canDismiss: true
      })
      await modal.present();
      let { data } = await modal.onWillDismiss();
      if (data && data !== undefined) {
        this.objects = [];
        this.uniqueGrouping = [];
        this.startDate = new Date(data.startDate);
        this.endDate = new Date(data.endDate);
        this.customerIds = data.customerIds;
        this.salesAgentIds = data.salesAgentIds;
        this.showDraftOnly = data.showDraftOnly ?? false;
        if (data.showDraftOnly) {
          this.loadDraftObjects();
        } else {
          this.loadObjects();
          this.loadDraftObjects();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  goToDetail(objectId: number, isDraft: boolean, draftTransactionId: number) {
    try {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: objectId,
          isDraft: isDraft,
          draftTransactionId: draftTransactionId
        }
      }
      this.navController.navigateForward("/transactions/sales-order/sales-order-detail", navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
