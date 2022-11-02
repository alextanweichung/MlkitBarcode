import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CommonService } from '../../../../shared/services/common.service';
import { QuotationService } from '../../services/quotation.service';
import { SalesOrderService } from '../../services/sales-order.service';

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
    this.startDate = event.detail.value;
    this.date_from = format(parseISO(event.detail.value), 'MMM d, yyyy');;
    this.date_from_active = false;
  }

  // On date to select
  onDateToSelect(event: any) {
    this.endDate = event.detail.value;
    this.date_to = format(parseISO(event.detail.value), 'MMM d, yyyy');;
    this.date_to_active = false;
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
    this.filters = { startDate: this.startDate, endDate: this.endDate };

    // Dismiss modal and apply filters
    this.modalController.dismiss(this.filters);
  }

}
