import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DebtorOutstanding, DebtorOutstandingRequest } from '../../../models/debtor-outstanding';
import { ReportsService } from '../../../services/reports.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ViewWillEnter } from '@ionic/angular';
import { CreditInfoDetails } from 'src/app/shared/models/credit-info';

@Component({
  selector: 'app-debtor-latest-outstanding',
  templateUrl: './debtor-latest-outstanding.page.html',
  styleUrls: ['./debtor-latest-outstanding.page.scss']
})
export class DebtorLatestOutstandingPage implements OnInit, ViewWillEnter {

  customers: Customer[] = [];
  customerSearchDropdownList: SearchDropdownList[] = [];
  objects: DebtorOutstanding[] = [];

  data: any;
  columns: any;

  constructor(
    private reportService: ReportsService,
    private toastService: ToastService,
    private commonService: CommonService
  ) { }

  ionViewWillEnter(): void {
    if (!this.trxDate) {
      this.trxDate = this.commonService.getTodayDate();
    }
  }

  ngOnInit() {
    this.loadCustomers();
    this.columns = [
      { prop: 'customerName', name: 'Customer', draggable: false },
      { prop: 'salesAgentName', name: 'SA', draggable: false },
      { prop: 'currencyCode', name: 'Currency', draggable: false },
      { prop: 'balance', name: 'Outstanding', draggable: false }
    ]
    this.creditCols = [
      { prop: 'trxDate', name: 'Trx Date', draggable: false },
      { prop: 'overdueDay', name: 'O/D Day', draggable: false },
      { prop: 'docNum', name: 'Doc. Number', draggable: false },
      { prop: 'amount', name: 'Amount', draggable: false }
    ]
  }

  loadCustomers() {
    this.reportService.getCustomers().subscribe(async response => {
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

  loadDebtorReport() {
    let obj: DebtorOutstandingRequest = {
      customerId: this.customerIds??[],
      trxDate: format(this.trxDate, 'yyyy-MM-dd')
    }
    this.reportService.getDebtorOutstanding(obj).subscribe(response => {
      this.objects = response;
      this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
    }, error => {
      console.log(error);
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

  async downloadPdf(customerId: number) {
    let paramModel: ReportParameterModel = {
      appCode: 'FAAR005',
      format: 'pdf',
      documentIds: [],
      reportName: 'Debtor Statement',
      customReportParam: {
        parameter1: customerId,
        statementDate: this.trxDate
      }
    }
    this.reportService.getPdf(paramModel).subscribe(async response => {
      await this.commonService.commonDownloadPdf(response, paramModel.reportName + "." + paramModel.format);
    }, error => {
      console.log(error);
    })
  }


  loadCreditInfo(customerId: number) {
    this.reportService.getCreditInfo(customerId).subscribe(response => {
      this.displayDetails(response.outstanding, 'Outstanding Amount');
    }, error => {
      console.error(error);
    })
  }

  displayModal: boolean = false;
  creditInfoType: string = '';
  tableValue: CreditInfoDetails[] = [];
  creditCols: any[] = [];
  displayDetails(tableValue: CreditInfoDetails[], infoType: string) {
    try {
      this.displayModal = true;
      this.creditInfoType = infoType;
      this.tableValue = [];
      this.tableValue = [...tableValue];
    } catch (e) {
      console.error(e);
    }
  }
  
  hideItemModal() {
    this.displayModal = false;
  }

}
