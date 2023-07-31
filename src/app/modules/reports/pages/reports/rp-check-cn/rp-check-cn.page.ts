import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../../services/reports.service';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CheckCn, CheckCnRequest } from '../../../models/rp-check-cn';
import { AlertController, IonPopover } from '@ionic/angular';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-rp-check-cn',
  templateUrl: './rp-check-cn.page.html',
  styleUrls: ['./rp-check-cn.page.scss'],
})
export class RpCheckCnPage implements OnInit {

  constructor(
    private authService: AuthService,
    private objectService: ReportsService,    
    private commonService: CommonService,
    private toastService: ToastService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadCustomers();
  }

  customers: Customer[] = [];
  customerSearchDropdownList: SearchDropdownList[] = [];
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

  customerIds: number[] = [];
  onCustomerSelected(event: any[]) {
    if (event && event !== undefined) {
      this.customerIds = event.flatMap(r => r.id);
    } else {
      this.customerIds = [];
    }
  }

  objects: CheckCn[] = [];
  loadReport() {
    this.objects = [];
    let obj: CheckCnRequest = {
      customerIds: this.customerIds
    }
    try {
      this.objectService.getCheckCn(obj).subscribe(response => {
        this.objects = response;
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000, this.authService.showSearchResult);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  async presentAlertViewPdf(transactionType: string, docId: number, docNum: string) {
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
              await this.downloadPdf(transactionType, Number(docId), docNum);
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

  async downloadPdf(transactionType: string, docId: number, docNum: string) {
    try {
      let paramModel: ReportParameterModel = {
        appCode: (transactionType.toUpperCase() === 'ARCN') ? 'FAAR004' : 'SMSC004',
        format: 'pdf',
        documentIds: [Number(docId)],
        reportName: (transactionType.toUpperCase() === 'ARCN') ? 'AR Credit Note' : 'Sales Return'
      }
      this.objectService.getPdf(paramModel).subscribe(async response => {
        await this.commonService.commonDownloadPdf(response, docNum + "." + paramModel.format);
      }, error => {
        throw error;
      })
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
  
  /* #region select all */

  SelectionType = SelectionType;
  selected = [];
  
  onSelect(event) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...event.selected);
  }

  onActivate(event) {

  }

  async printAllAlert() {
    console.log("🚀 ~ file: rp-check-cn.page.ts:154 ~ RpCheckCnPage ~ printAllAlert ~ this.selected:", this.selected)
    try {
      const alert = await this.alertController.create({
        header: `Download ${this.selected.length} PDF?`,
        message: '',
        buttons: [
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              await this.downloadMultiplePdf(this.selected);
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
  async downloadMultiplePdf(objects: CheckCn[]) {
    try {
      // appCode: (transactionType.toUpperCase() === 'ARCN') ? 'FAAR004' : 'SMSC004',
      // reportName: (transactionType.toUpperCase() === 'ARCN') ? 'AR Credit Note' : 'Sales Return'

      if (objects.filter(r => r.transactionType.toUpperCase() === 'ARCN').length > 0) {
        let paramModel: ReportParameterModel = {
          appCode: 'FAAR004',
          format: 'pdf',
          documentIds: objects.filter(r => r.transactionType.toUpperCase() === 'ARCN').flatMap(r => r.docId),
          reportName: 'AR Credit Note'
        }
        this.objectService.getPdf(paramModel).subscribe(async response => {
          await this.commonService.commonDownloadPdf(response, "ARCreditNote." + paramModel.format);
        }, error => {
          throw error;
        })
      }

      if (objects.filter(r => r.transactionType.toUpperCase() === 'SR').length > 0) {        
        let paramModel: ReportParameterModel = {
          appCode: 'SMSC004',
          format: 'pdf',
          documentIds: objects.filter(r => r.transactionType.toUpperCase() === 'SR').flatMap(r => r.docId),
          reportName: 'Sales Return'
        }
        this.objectService.getPdf(paramModel).subscribe(async response => {
          await this.commonService.commonDownloadPdf(response, "SalesReturn." + paramModel.format);
        }, error => {
          throw error;
        })
      }

    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */
  
}
