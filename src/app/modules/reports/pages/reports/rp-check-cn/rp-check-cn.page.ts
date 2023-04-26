import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../../services/reports.service';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CheckCn, CheckCnRequest } from '../../../models/rp-check-cn';
import { AlertController } from '@ionic/angular';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';

@Component({
  selector: 'app-rp-check-cn',
  templateUrl: './rp-check-cn.page.html',
  styleUrls: ['./rp-check-cn.page.scss'],
})
export class RpCheckCnPage implements OnInit {

  constructor(
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
      this.customers = this.customers.filter(r => r.businessModelType === 'T');
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
    let loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if (loginUser.salesAgentId && loginUser.salesAgentId > 0) {
      let obj: CheckCnRequest = {
        salesAgentId: loginUser.salesAgentId,
        customerIds: this.customerIds
      }
      try {
        this.objectService.getCheckCn(obj).subscribe(response => {
          this.objects = response;
          console.log("🚀 ~ file: rp-check-cn.page.ts:67 ~ RpCheckCnPage ~ this.objectService.getCheckCn ~ this.objects:", this.objects)
          this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
        }, error => {
          throw error;
        })
      } catch (e) {
        console.error(e);
      }
    } else {
      this.toastService.presentToast('System Error', 'Please contact Administrator.', 'top', 'danger', 1000);
    }
  }

  async presentAlertViewPdf(objectId: any) {
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
              await this.downloadPdf(Number(objectId));
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

  async downloadPdf(objectId: number) {
    try {
      let paramModel: ReportParameterModel = {
        appCode: 'FAAR004',
        format: 'pdf',
        documentIds: [Number(objectId)],
        reportName: 'AR Credit Note'
      }
      this.objectService.getPdf(paramModel).subscribe(async response => {
        await this.commonService.commonDownloadPdf(response, paramModel.reportName + "." + paramModel.format);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

}
