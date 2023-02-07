import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/modules/transactions/models/customer';
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

  loadDebtorReport(customerId: number) {    
    this.reportService.getDebtorOutstanding(customerId).subscribe(response => {
      this.objects = response;
    }, error => {
      console.log(error);
    })
  }

  onCustomerSelected(event) {
    if (event && event !== undefined) {
      this.loadDebtorReport(event.id);
    }
  }

}
