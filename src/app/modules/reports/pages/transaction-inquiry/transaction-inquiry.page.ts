import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ViewWillEnter } from '@ionic/angular';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CalendarInputPage } from 'src/app/shared/pages/calendar-input/calendar-input.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../services/reports.service';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { TransactionInquiryObject } from '../../models/transaction-inquiry';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';

@Component({
  selector: 'app-transaction-inquiry',
  templateUrl: './transaction-inquiry.page.html',
  styleUrls: ['./transaction-inquiry.page.scss'],
})
export class TransactionInquiryPage implements OnInit, ViewWillEnter {

  type: SearchDropdownList[] = [];
  selectedType: SearchDropdownList = null;
  customer: Customer[] = [];
  customerSearchDropdown: SearchDropdownList[] = [];
  selectedCustomer: SearchDropdownList = null;
  docNum: string;

  object: TransactionInquiryObject[] = [];

  @ViewChild("datefrom", { static: false }) datefrom: CalendarInputPage;
  @ViewChild("dateto", { static: false }) dateto: CalendarInputPage;

  constructor(
    private commonService: CommonService,
    private objectService: ReportsService,
    private toastService: ToastService,
    private alertController: AlertController
  ) { }

  ionViewWillEnter(): void {
    if (this.trxDate === null || this.trxDate === undefined) {
      this.trxDate = this.commonService.getTodayDate();
    }
    if (this.trxDateFrom === null || this.trxDateFrom === undefined) {
      this.trxDateFrom = this.commonService.getFirstDayOfTodayMonth();
    }
  }

  ngOnInit() {
    this.loadCustomer();
    this.type.push(
      { id: 0, code: "SO", description: "Sales Order" },
      { id: 1, code: "SI", description: "Sales Invoice" },
      { id: 2, code: "CN/SR", description: "CN/Sales Return" },
      // { id: 3, code: "S", description: "Statement" }
    );
  }

  loadCustomer() {
    this.customerSearchDropdown = [];
    this.objectService.getCustomers().subscribe(response => {
      this.customer = response;
      this.customer.forEach(r => {
        this.customerSearchDropdown.push({
          id: r.customerId,
          code: r.customerCode,
          description: r.name
        })
      })
    }, error => {
      console.error(error);
    })
  }

  objects: any[] = [];
  loadReport() {
    this.object = [];
    this.objectService.getTransactionInquiry({ type: this.selectedType?.code, dateStart: this.trxDateFrom, dateEnd: this.trxDate, customerId: (this.selectedCustomer ? [this.selectedCustomer?.id] : null), wildDocNum: this.docNum }).subscribe(response => {
      this.object = response;
    }, error => {
      console.error(error);
    })
  }

  onTypeChanged(event: any) {
    this.selectedType = event;
  }

  onCustomerChanged(event: any) {
    this.selectedCustomer = event;
  }

  trxDateFrom: Date = null
  onDateFromSelected(event) {
    if (event) {
      this.trxDateFrom = event;
    }
  }

  trxDate: Date = null;
  onDateSelected(event) {
    if (event) {
      this.trxDate = event;
    }
  }

  /* #region select all */

  SelectionType = SelectionType;
  selected = [];
  onSelect(event) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...event.selected);
  }

  onActivate(event) {

  }

  /* #endregion */

  /* #region download */

  async presentAlertViewPdf(object: TransactionInquiryObject) {
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
              await this.downloadPdf(object);
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

  async downloadPdf(object: TransactionInquiryObject) {
    if (object) {
      let appCode = "";
      let reportName = "";
      switch (object.type) {
        case "SalesOrder":
          appCode = "SMSC002";
          reportName = "Sales Order";
          break;
        case "SalesInvoice":
          appCode = "SMSC003";
          reportName = "Sales Invoice";
          break;
        case "SalesReturn":
          appCode = "SMSC004";
          reportName = "Sales Return";
          break;
        case "CreditNote":
          appCode = "FAAR004";
          reportName = "AR Credit Note";
          break;
      }
      if (appCode !== null && appCode.length > 0) {
        let paramModel: ReportParameterModel = {
          appCode: appCode,
          format: "pdf",
          documentIds: [object.docId],
          reportName: reportName
        }
        let timestart = new Date();
        await this.objectService.getPdf(paramModel).subscribe(async response => {
          let timeend = new Date();
          await this.commonService.commonDownloadPdf(response, object.docNum + "." + paramModel.format);
          this.toastService.presentToast(`download pdf`, (timeend.getTime() - timestart.getTime()).toString(), "top", "success", 1000);
        }, error => {
          console.log(error);
        })
      } else {
        this.toastService.presentToast("Invalid Key Id", "Please contact adminstrator.", "top", "danger", 1000);
      }
    } else {
      this.toastService.presentToast("Invalid App Code", "Please contact adminstrator.", "top", "danger", 1000);
    }
  }

  /* #endregion */

}
