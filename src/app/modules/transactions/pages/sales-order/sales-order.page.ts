import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesOrderList } from '../../models/sales-order';
import { CommonService } from '../../../../shared/services/common.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { Customer } from '../../models/customer';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.page.html',
  styleUrls: ['./sales-order.page.scss']
})
export class PickingSalesOrderPage implements OnInit, ViewWillEnter {

  objects: SalesOrderList[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    private commonService: CommonService,
    private salesOrderService: SalesOrderService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingService: LoadingService,
    private modalController: ModalController,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTheYear();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
    this.loadCustomerList();
  }

  ngOnInit() {

  }

  /* #region  crud */

  loadObjects() {
    try {
      let obj: SalesSearchModal =  {
        dateStart: format(this.startDate, 'yyyy-MM-dd'),
        dateEnd: format(this.endDate, 'yyyy-MM-dd'),
        customerId: this.customerIds
      }
      this.salesOrderService.getObjectListByDate(obj).subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
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

  customers: Customer[] = [];
  selectedCustomer: Customer;
  customerSearchDropdownList: SearchDropdownList[] = [];
  loadCustomerList() {
    try {
      this.salesOrderService.getCustomerList().subscribe(async response => {
        this.customers = response;
        this.customers = this.customers.filter(r => r.businessModelType === 'T');
        await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
        this.customers.forEach(r => {
          this.customerSearchDropdownList.push({
            id: r.customerId,
            code: r.customerCode,
            description: r.name
          })
        })
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  add quotation */

  async addObject() {
    try {
      if (this.salesOrderService.hasSalesAgent()) {
        this.navController.navigateForward('/transactions/sales-order/sales-order-header');
      } else {
        this.toastService.presentToast('Invalid Sales Agent', '', 'top', 'danger', 1000);
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
            text: 'Add Sales Order',
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

  async presentAlertViewPdf(doc) {
    try {
      const alert = await this.alertController.create({
        header: '',
        subHeader: 'View Pdf?',
        message: '',
        buttons: [
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              await this.downloadPdf(doc);
            },
          },
          {
            cssClass: 'cancel',
            text: 'Cancel',
            role: 'cancel'
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
      this.salesOrderService.downloadPdf("SMSC002", "pdf", doc.salesOrderId).subscribe(response => {
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

  async filter() {
    try {
      const modal = await this.modalController.create({
        component: FilterPage,
        componentProps: {
          startDate: this.startDate,
          endDate: this.endDate,
          customerFilter: true,
          customerList: this.customerSearchDropdownList,
          selectedCustomerId: this.customerIds
        },
        canDismiss: true
      })
      await modal.present();
      let { data } = await modal.onWillDismiss();
      if (data && data !== undefined) {
        this.startDate = new Date(data.startDate);
        this.endDate = new Date(data.endDate);
        this.customerIds = data.customerIds;
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
      this.navController.navigateForward('/transactions/sales-order/sales-order-detail', navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
