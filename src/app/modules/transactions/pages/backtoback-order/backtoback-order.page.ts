import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { FilterPage } from '../filter/filter.page';
import { ViewWillEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { BackToBackOrderService } from '../../services/backtoback-order.service';
import { BackToBackOrderList } from '../../models/backtoback-order';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-backtoback-order',
  templateUrl: './backtoback-order.page.html',
  styleUrls: ['./backtoback-order.page.scss'],
})
export class BackToBackOrderPage implements OnInit, ViewWillEnter {

  objects: BackToBackOrderList[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];
  salesAgentIds: number[] = [];

  uniqueGrouping: Date[] = [];

  salesAgentDropdownList: SearchDropdownList[] = [];

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private objectService: BackToBackOrderService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private navController: NavController,
    private toastService: ToastService
  ) {
    // reload all masterlist whenever user enter listing
    this.objectService.loadRequiredMaster();
  }

  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
    // this.bindCustomerList();
    // this.bindSalesAgentList();
  }

  ngOnInit() {

  }

  /* #region  crud */

  loadObjects() {
    try {
      this.objectService.getObjectListByDate(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000, this.authService.showSearchResult);
      }, error => {
        throw error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
  }

  // selectedCustomer: Customer;
  // customerSearchDropdownList: SearchDropdownList[] = [];
  // bindCustomerList() {
  //   this.objectService.customers.forEach(r => {
  //     this.customerSearchDropdownList.push({
  //       id: r.customerId,
  //       code: r.customerCode,
  //       oldCode: r.oldCustomerCode,
  //       description: r.name
  //     })
  //   })
  // }

  // bindSalesAgentList() {
  //   this.objectService.salesAgentMasterList.forEach(r => {
  //     this.salesAgentDropdownList.push({
  //       id: r.id,
  //       code: r.code,
  //       description: r.description
  //     })
  //   })
  // }

  /* #endregion */

  /* #region  add quotation */

  async addObject() {
    try {
      if (this.objectService.hasSalesAgent()) {
        this.navController.navigateForward('/transactions/backtoback-order/backtoback-order-header');
      } else {
        this.toastService.presentToast('System Error', 'Sales Agent not set.', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Choose an action',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Add B2B Order',
            icon: 'document-outline',
            handler: () => {
              this.addObject();
            }
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel'
          }]
      });
      await actionSheet.present();
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region download pdf */

  // async presentAlertViewPdf(doc) {
  //   try {
  //     const alert = await this.alertController.create({
  //       header: 'Download PDF?',
  //       message: '',
  //       buttons: [
  //         {
  //           text: 'OK',
  //           cssClass: 'success',
  //           role: 'confirm',
  //           handler: async () => {
  //             await this.downloadPdf(doc);
  //           },
  //         },
  //         {
  //           cssClass: 'cancel',
  //           text: 'Cancel',
  //           role: 'cancel'
  //         },
  //       ]
  //     });
  //     await alert.present();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // async downloadPdf(doc) {
  //   try {
  //     this.objectService.downloadPdf("SMSC002", "pdf", doc.salesOrderId).subscribe(response => {
  //       let filename = doc.salesOrderNum + ".pdf";
  //       this.commonService.commonDownloadPdf(response, filename);
  //     }, error => {
  //       throw error;
  //     })
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  /* #endregion */

  async filter() {
    try {
      const modal = await this.modalController.create({
        component: FilterPage,
        componentProps: {
          startDate: this.startDate,
          endDate: this.endDate,
          customerFilter: false,
          salesAgentFilter: false
        },
        canDismiss: true
      })
      await modal.present();
      let { data } = await modal.onWillDismiss();
      if (data && data !== undefined) {
        this.startDate = new Date(data.startDate);
        this.endDate = new Date(data.endDate);
        this.loadObjects();
      }
    } catch (e) {
      console.error(e);
    }
  }

  goToDetail(objectId: number) {
    try {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: objectId
        }
      }
      this.navController.navigateForward('/transactions/backtoback-order/backtoback-order-detail', navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
