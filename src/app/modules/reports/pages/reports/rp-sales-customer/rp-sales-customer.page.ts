import { Component, OnInit } from '@angular/core';
import { SalesByCustomer, SalesByCustomerRequest } from '../../../models/rp-sales-customer';
import { ReportsService } from '../../../services/reports.service';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-rp-sales-customer',
  templateUrl: './rp-sales-customer.page.html',
  styleUrls: ['./rp-sales-customer.page.scss'],
})
export class RpSalesCustomerPage implements OnInit, ViewWillEnter {

  customers: Customer[] = [];
  customerSearchDropdownList: SearchDropdownList[] = [];
  
  startDate: Date = null;
  endDate: Date = null;

  objects: SalesByCustomer[] = [];

  columns: any;

  constructor(
    private reportService: ReportsService,    
    private commonService: CommonService,
    private toastService: ToastService
  ) { }

  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
  }

  ngOnInit() {
    this.loadCustomers();
    this.columns = [
      { prop: 'customerCode', name: 'Debtor Code', draggable: false },
      { prop: 'customerName', name: 'Debtor Name', draggable: false },
      { prop: 'trxMonth', name: 'Trx Month', draggable: false },
      { prop: 'salesAmount', name: 'Sales Amount', draggable: false }
    ]
  }

  loadCustomers() {
    this.reportService.getCustomers().subscribe(async response => {
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

  loadReport() {
    if (!this.startDate || !this.endDate) {
      this.toastService.presentToast('Error', 'Invalid Date', 'top', 'warning', 1000);
    } else {
      let obj: SalesByCustomerRequest = {
        customerId: this.customerIds,
        dateStart: format(this.startDate, 'yyyy-MM-dd'),
        dateEnd: format(this.endDate, 'yyyy-MM-dd')
      }
      try {
        this.reportService.getSalesByCustomer(obj).subscribe(response => {
          this.objects = response;
        }, error => {
          throw error;
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  customerIds: number[] = [];
  onCustomerSelected(event: any[]) {
    if (event && event !== undefined) {
      this.customerIds = event.flatMap(r => r.id);
    }
  }

  onStartDateSelected(event) {
    if (event) {
      this.startDate = event;
    }
  }

  onEndDateSelected(event) {
    if (event) {
      this.endDate = event;
    }
  }

}
