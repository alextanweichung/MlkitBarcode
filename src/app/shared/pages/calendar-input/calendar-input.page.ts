import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-calendar-input',
  templateUrl: './calendar-input.page.html',
  styleUrls: ['./calendar-input.page.scss'],
})
export class CalendarInputPage implements OnInit {

  @Input() title: string = 'Date';
  @Input() defaultDate: Date = new Date();
  @Input() labelPosition = 'stacked';
  @Output() onDateSelected: EventEmitter<Date> = new EventEmitter();

  date_active: boolean = false;
  date_display: string;
  date_value: Date;

  constructor() { }

  ngOnInit() {
    if (!this.date_value) {
      this.date_value = this.defaultDate;
      this.date_display = format(parseISO(this.date_value.toISOString()), 'MMM d, yyyy');
      this.onDateSelected.emit(this.date_value);
    }
  }

  // Toggle date from
  toggleDate() {
    this.date_active = this.date_active ? false : true;
    // this.date_to_active = false;
  }

  // On date from select
  onDateSelect(event: any) {
    let date = new Date(event.detail.value);
    this.date_value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    this.date_display = format(parseISO(event.detail.value), 'MMM d, yyyy');
    this.date_active = false;
    this.onDateSelected.emit(this.date_value);
  }

  resetControl() {
    this.date_active = false;
    this.date_value = this.defaultDate;
    this.date_display = format(parseISO(this.date_value.toISOString()), 'MMM d, yyyy');    
  }

}
