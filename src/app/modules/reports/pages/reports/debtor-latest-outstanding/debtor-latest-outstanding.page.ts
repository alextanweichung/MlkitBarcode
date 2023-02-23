import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DebtorOutstanding } from '../../../models/debtor-outstanding';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-debtor-latest-outstanding',
  templateUrl: './debtor-latest-outstanding.page.html',
  styleUrls: ['./debtor-latest-outstanding.page.scss'],
})
export class DebtorLatestOutstandingPage implements OnInit {

  customers: Customer[] = [];
  customerSearchDropdownList: SearchDropdownList[] = [];
  objects: DebtorOutstanding[] = [];

  constructor(
    private reportService: ReportsService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadCustomers();
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
          description: r.name
        })
      })
    }, error => {
      console.log(error);
    })
  }

  loadDebtorReport() {    
    if (this.customerId && this.trxDate) {
      this.reportService.getDebtorOutstanding(this.customerId, format(this.trxDate, 'yyyy-MM-dd')).subscribe(response => {
        this.objects = response;
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
      }, error => {
        console.log(error);
      })
    } else {
      this.toastService.presentToast('Invalid Search', '', 'top', 'danger', 1000);
    }
  }

  customerId: number;
  onCustomerSelected(event) {
    if (event && event !== undefined) {
      this.customerId = event.id;
    }
  }

  trxDate: Date;
  onDateSelected(event) {
    if (event) {
      this.trxDate = event;
    }
  }

  downloadPdf(salesAgentId: number) {
    let paramModel: ReportParameterModel = {
      appCode: 'FAAR005',
      format: 'pdf',
      documentIds: [],
      reportName: 'Statement of Account',
      customReportParam: {
        parameter1: this.customerId,
        statementDate:  this.trxDate
      }
    }
    this.reportService.getPdf(paramModel).subscribe(blob => {
      let t: any = new Blob([blob]);
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(t);
      a.href = objectUrl;
      a.download = paramModel.reportName + '.' + paramModel.format;
      a.click();
      URL.revokeObjectURL(objectUrl);      
    }, error => {
      console.log(error);
    })
  }

}
