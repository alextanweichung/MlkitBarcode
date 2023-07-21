import { Component, OnInit } from '@angular/core';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportSOListing } from '../../../models/rp-so-listing';
import { ReportsService } from '../../../services/reports.service';
import { AlertController, ViewWillEnter } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DebtorOutstandingRequest } from '../../../models/debtor-outstanding';
import { format } from 'date-fns';

@Component({
  selector: 'app-rp-so-listing',
  templateUrl: './rp-so-listing.page.html',
  styleUrls: ['./rp-so-listing.page.scss'],
})
export class RpSoListingPage implements OnInit, ViewWillEnter {

  customers: Customer[] = [];
  customerSearchDropdownList: SearchDropdownList[] = [];
  objects: ReportSOListing[] = [];
  isOverdueOnly: boolean = false;

  data: any;
  columns: any;

  constructor(
    private objectService: ReportsService,
    private commonService: CommonService,
    private alertController: AlertController
  ) { }

  ionViewWillEnter(): void {
    if (!this.trxDate) {
      this.trxDate = this.commonService.getTodayDate();
    }
  }

  ngOnInit() {
    this.loadCustomers();
    this.columns = [
      { prop: 'issuedDate', name: 'Issued Date', draggable: false },
      { prop: 'debtorCode', name: 'Debtor Code', draggable: false },
      { prop: 'debtorName', name: 'Debtor Name', draggable: false },
      { prop: 'salesmanName', name: 'Salesman', draggable: false },
      // { prop: 'onlineOrder', name: 'Online Order', draggable: false },
      { prop: 'orderStatus', name: 'Order Status', draggable: false },
      { prop: 'salesOrderNum', name: 'Sales Order', draggable: false },
      { prop: 'deliveryOrderIds', name: 'Delivery Order', draggable: false },
      { prop: 'delivered', name: 'Delivered', draggable: false },
      { prop: 'netAmount', name: 'Net Amount', draggable: false }
    ]
  }

  loadCustomers() {
    this.objectService.getCustomers().subscribe(async response => {
      this.customers = response;
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
      this.customers.forEach(r => {
        this.customerSearchDropdownList.push({
          id: r.customerId,
          code: r.customerCode,
          oldCode: r.oldCustomerCode,
          description: r.name
        })
      })
    }, error => {
      console.log(error);
    })
  }

  loadObjects() {
    let obj: DebtorOutstandingRequest = { // sharing same report request parameter
      customerId: this.customerIds ?? [],
      trxDate: format(this.trxDate, 'yyyy-MM-dd'),
      isOverdueOnly: this.isOverdueOnly
    }
    this.objectService.getSOListing(obj).subscribe(response => {
      console.log("🚀 ~ file: rp-so-listing.page.ts:79 ~ RpSoListingPage ~ this.objectService.getSOListing ~ response:", response)
      this.objects = response;
    }, error => {
      throw error;
    })
  }

  customerIds: number[];
  onCustomerSelected(event: any[]) {
    if (event && event !== undefined) {
      this.customerIds = event.flatMap(r => r.id);
    }
  }

  trxDate: Date = null;
  onDateSelected(event) {
    if (event) {
      this.trxDate = event;
    }
  }

  error: any;
  async downloadPdf(objectId: number, objectName: string) {
    try {
      let paramModel: ReportParameterModel = {
        appCode: 'SMSC002',
        format: 'pdf',
        documentIds: [Number(objectId)],
        reportName: 'Sales Order'
      }
      this.objectService.getPdf(paramModel).subscribe(async response => {
        await this.commonService.commonDownloadPdf(response, objectName + "." + paramModel.format).then((ret) => {
          this.error = ret;
        }).catch(error => {
          error = error;
        });
      }, error => {
        error = error;
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  doDialog: boolean = false;
  deliveryOrderObject: string[] = [];
  async showDialogOrDownload(deliveryOrders: string) {
    this.deliveryOrderObject = []
    try {
      this.deliveryOrderObject = deliveryOrders.split(';');
      if (this.deliveryOrderObject && this.deliveryOrderObject.length === 1) {
        await this.presentAlertViewPdf(Number(this.deliveryOrderObject[0].split('|')[1]), this.deliveryOrderObject[0].split('|')[0], 'DO');
      } else {
        this.showDoDialog();
      }
    } catch (e) {
      console.error(e);
    }
  }

  showDoDialog() {
    this.doDialog = true;
  }

  hideDoDialog() {
    this.doDialog = false;
  }

  async presentAlertViewPdf(objectId: any, objectName: string, type: string) {
    try {
      const alert = await this.alertController.create({
        header: 'Download PDF?',
        message: '',
        buttons: [
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              if (type === 'SO') {
                await this.downloadPdf(Number(objectId), objectName);
              } else {
                await this.downloadDOPdf(Number(objectId), objectName);
              }
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

  downloadDOPdf(objectId: number, objectName: string) {
    let paramModel: ReportParameterModel = {
      appCode: 'WDOP001',
      format: 'pdf',
      documentIds: [Number(objectId)],
      reportName: 'Delivery Order'
    }
    this.objectService.getPdf(paramModel).subscribe(async response => {
      await this.commonService.commonDownloadPdf(response, objectName + "." + paramModel.format);
    }, error => {
      throw error;
    })
  }

}
