import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { QuotationService } from '../../services/quotation.service';

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
  startDate: any;
  endDate: any;

  constructor(
    private quotationService: QuotationService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.quotationService.startDate.toISOString()
      this.date_from = format(parseISO(this.startDate), 'MMM d, yyyy');
    }
    if (!this.endDate) {
      this.endDate = this.quotationService.endDate.toISOString();
      this.date_to = format(parseISO(this.endDate), 'MMM d, yyyy');
    }
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
    this.quotationService.startDate = new Date(this.startDate);
    this.quotationService.endDate = new Date(this.endDate);

    // Dismiss modal and apply filters
    this.modalController.dismiss(this.filters);
  }

}
