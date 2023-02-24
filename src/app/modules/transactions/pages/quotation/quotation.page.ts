import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { QuotationList } from '../../models/quotation';
import { CommonService } from '../../../../shared/services/common.service';
import { QuotationService } from '../../services/quotation.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { Customer } from '../../models/customer';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
  providers: [File, FileOpener, AndroidPermissions]
})
export class QuotationPage implements OnInit {

  objects: QuotationList[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];

  constructor(
    private commonService: CommonService,
    private quotationService: QuotationService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private navController: NavController,
    private toastService: ToastService,
    private androidPermissions: AndroidPermissions,    
    private opener: FileOpener,
    private file: File,
  ) { }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
    this.loadCustomerList();
  }

  /* #region  crud */

  loadObjects() {
    try {
      let obj: SalesSearchModal =  {
        dateStart: format(this.startDate, 'yyyy-MM-dd'),
        dateEnd: format(this.endDate, 'yyyy-MM-dd'),
        customerId: this.customerIds
      }
      this.quotationService.getObjectListByDate(obj).subscribe(response => {
        this.objects = response;
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  customers: Customer[] = [];
  selectedCustomer: Customer;
  customerSearchDropdownList: SearchDropdownList[] = [];
  loadCustomerList() {
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
      console.log(error);
    })
  }

  /* #endregion */

  /* #region  add quotation */

  async addObject() {
    if (this.quotationService.hasSalesAgent()) {
      this.navController.navigateForward('/transactions/quotation/quotation-header');
    } else {
      this.toastService.presentToast('Invalid Sales Agent', '', 'top', 'dnager', 1000);
    }
  }

  async selectAction() {
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
  }

  /* #endregion */

  /* #region download pdf */

  async presentAlertViewPdf(doc) {
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
  }

  async downloadPdf(doc) {
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Downloading...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    this.quotationService.downloadPdf("SMSC001", "pdf", doc.quotationId).subscribe(response => {
      let filename = doc.quotationNum + ".pdf";
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
  }

  /* #endregion */

  async filter() {
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
  }
  
  goToDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/quotation/quotation-detail', navigationExtras);
  }

}
