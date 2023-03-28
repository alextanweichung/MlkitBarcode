import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { QuotationList } from '../../models/quotation';
import { CommonService } from '../../../../shared/services/common.service';
import { QuotationService } from '../../services/quotation.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { Customer } from '../../models/customer';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss']
})
export class QuotationPage implements OnInit, ViewWillEnter {

  objects: QuotationList[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    private commonService: CommonService,
    private quotationService: QuotationService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController,
    private toastService: ToastService,
    private loadingService: LoadingService
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
      let obj: SalesSearchModal = {
        dateStart: format(this.startDate, 'yyyy-MM-dd'),
        dateEnd: format(this.endDate, 'yyyy-MM-dd'),
        customerId: this.customerIds
      }
      this.quotationService.getObjectListByDate(obj).subscribe(async response => {
        this.objects = response;
        this.objects = this.commonService.convertArrayAllDateType(this.objects);
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
      }, error => {
        throw Error;
      })
    } catch (e) {
      console.error(e);
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
      this.quotationService.getCustomerList().subscribe(async response => {
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
      if (this.quotationService.hasSalesAgent()) {
        this.navController.navigateForward('/transactions/quotation/quotation-header');
      } else {
        this.toastService.presentToast('Invalid Sales Agent', '', 'top', 'dnager', 1000);
      }      
    } catch (e) {
      console.error(e);
    }
  }

  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Choose an action',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Add Quotation',
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
      this.quotationService.downloadPdf("SMSC001", "pdf", doc.quotationId).subscribe(response => {
        let filename = doc.quotationNum + ".pdf";
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
      this.navController.navigateForward('/transactions/quotation/quotation-detail', navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
