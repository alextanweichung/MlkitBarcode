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
  @Input() presentation = 'date';
  @Output() onDateSelected: EventEmitter<Date> = new EventEmitter();

  date_active: boolean = false;
  date_display: string;
  date_value_for_ion_calendar: Date;
  date_value: Date;

  constructor() { }

  ngOnInit() {
    if (!this.date_value) {
      if (this.presentation === 'date-time') {
        this.date_value = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), this.defaultDate.getHours(), this.defaultDate.getMinutes(), 0);
        this.date_value_for_ion_calendar = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), this.defaultDate.getHours(), this.defaultDate.getMinutes(), 0);
      } else {
        this.date_value = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), 0, 0, 0);
        this.date_value_for_ion_calendar = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), 0, 0, 0);
      }
      this.date_value_for_ion_calendar.setMinutes(this.date_value_for_ion_calendar.getMinutes() - this.date_value_for_ion_calendar.getTimezoneOffset());
      this.date_display = this.presentation === 'date-time' ? format(this.date_value, 'dd/MM/yyyy hh:mm aa') : format(this.date_value, 'dd/MM/yyyy');
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
    this.date_active = false
    if (this.presentation === 'date-time') {
      this.date_value = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0);
      this.date_value_for_ion_calendar = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0);
    } else {
      this.date_value = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      this.date_value_for_ion_calendar = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    }
    this.date_value_for_ion_calendar.setMinutes(this.date_value_for_ion_calendar.getMinutes() - this.date_value_for_ion_calendar.getTimezoneOffset());
    this.date_display = this.presentation === 'date-time' ? format(this.date_value, 'dd/MM/yyyy hh:mm aa') : format(this.date_value, 'dd/MM/yyyy');
    console.log("🚀 ~ file: calendar-input.page.ts ~ line 59 ~ CalendarInputPage ~ onDateSelect ~ this.date_value", this.date_value)
    this.onDateSelected.emit(this.date_value);
  }

  resetControl() {
    this.date_active = false;
    this.defaultDate = new Date();
    if (this.presentation === 'date-time') {
      this.date_value = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), this.defaultDate.getHours(), this.defaultDate.getMinutes(), 0);
      this.date_value_for_ion_calendar = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), this.defaultDate.getHours(), this.defaultDate.getMinutes(), 0);
    } else {
      this.date_value = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), 0, 0, 0);
      this.date_value_for_ion_calendar = new Date(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), 0, 0, 0);
    }
    this.date_value_for_ion_calendar.setMinutes(this.date_value_for_ion_calendar.getMinutes() - this.date_value_for_ion_calendar.getTimezoneOffset());
    this.date_display = this.presentation === 'date-time' ? format(this.date_value, 'dd/MM/yyyy hh:mm aa') : format(this.date_value, 'dd/MM/yyyy');
  }

}
