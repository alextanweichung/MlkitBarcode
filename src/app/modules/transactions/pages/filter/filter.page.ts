import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from '../../../../shared/services/common.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {

  filters: any;

  date_from_active: boolean = false;
  date_to_active: boolean = false;

  date_from: any;
  date_to: any;
  startDate: Date;
  endDate: Date;

  customerFilter: boolean = false;
  customerList: SearchDropdownList[] = [];

  salesAgentFilter: boolean = false;
  salesAgentList: SearchDropdownList[] = [];

  useDraft: boolean = false;
  showDraftOnly: boolean = true;

  constructor(
    private commonService: CommonService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.date_from = format(parseISO(this.startDate.toISOString()), 'MMM d, yyyy');
    this.date_to = format(parseISO(this.endDate.toISOString()), 'MMM d, yyyy');
  }

  // Toggle date from
  toggleDateFrom() {
    this.date_from_active = this.date_from_active ? false : true;
    this.date_to_active = false;
  }

  // Toggle date to
  toggleDateTo() {
    this.date_to_active = this.date_to_active ? false : true;
    this.date_from_active = false;
  }

  // On date from select
  onDateFromSelect(event: any) {
    let date = new Date(event.detail.value);
    this.startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    this.date_from = format(parseISO(event.detail.value), 'MMM d, yyyy');
    // this.date_from_active = false;
  }

  // On date to select
  onDateToSelect(event: any) {
    let date = new Date(event.detail.value);
    this.endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    this.date_to = format(parseISO(event.detail.value), 'MMM d, yyyy');
    // this.date_to_active = false;
  }

  selectedCustomerId: number[] = [];
  onCustomerSelected(event) {
    this.selectedCustomerId = [];
    if (event) {
      event.forEach(r => {
        this.selectedCustomerId.push(r.id)
      });
    }
  }

  selectedSalesAgentId: number[] = [];
  onSalesAgentSelected(event) {
    this.selectedSalesAgentId = [];
    if (event) {
      event.forEach(r => {
        this.selectedSalesAgentId.push(r.id);
      });
    }
  }

  // Cancel
  cancel() {
    // Dismiss modal
    this.modalController.dismiss();
  }

  // Apply filter
  apply() {
    // Add filter logic here...
    // ...
    // if (this.customerFilter || this.salesAgentFilter) {
    this.filters = { startDate: this.startDate, endDate: this.endDate, customerIds: this.selectedCustomerId, salesAgentIds: this.selectedSalesAgentId, showDraftOnly: this.showDraftOnly };
    // } else {
    //   this.filters = { startDate: this.startDate, endDate: this.endDate };
    // }

    // Dismiss modal and apply filters
    this.modalController.dismiss(this.filters);
  }

}
