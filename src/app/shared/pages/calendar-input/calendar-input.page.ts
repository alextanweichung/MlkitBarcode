import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-calendar-input',
  templateUrl: './calendar-input.page.html',
  styleUrls: ['./calendar-input.page.scss'],
})
export class CalendarInputPage implements OnInit, OnChanges {

  @Input() disabled: boolean = false;
  @Input() title: string = 'Date';
  defaultDate: Date = new Date();
  @Input() maxDateToday: boolean = false;
  @Input() labelPosition = 'stacked';
  @Input() presentation = 'date';
  @Output() onDateSelected: EventEmitter<Date> = new EventEmitter();

  date_active: boolean = false;
  date_display: string;
  today: Date;
  @Input() date_value: Date;
  date_value_here: Date;

  @ViewChild('ionDateTime', {static:false}) ionDateTime: IonDatetime

  constructor() { }

  // ion-calendar must use UTC
  // display must not use UTC

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.date_value) {
      if (this.date_value) {
        
        // console.log("🚀 ~ file: calendar-input.page.ts:35 ~ CalendarInputPage ~ ngOnChanges ~ this.date_value:", this.date_value)
        
        // let testUTC = new Date(Date.UTC(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.date_value.getHours(), this.date_value.getMinutes(), 0));
        // console.log("🚀 ~ file: calendar-input.page.ts:33 ~ CalendarInputPage ~ ngOnChanges ~ testUTC:", testUTC)
        
        // let testUTCDisplay = this.presentation === 'date-time' ? format(testUTC, 'dd/MM/yyyy hh:mm aa') : format(testUTC, 'dd/MM/yyyy');
        // console.log("🚀 ~ file: calendar-input.page.ts:36 ~ CalendarInputPage ~ ngOnChanges ~ testUTCDisplay:", testUTCDisplay)

        // let testNOUTC = new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.date_value.getHours(), this.date_value.getMinutes(), 0);
        // console.log("🚀 ~ file: calendar-input.page.ts:35 ~ CalendarInputPage ~ ngOnChanges ~ testNOUTC:", testNOUTC)
        
        // let testNOUTCDisplay = this.presentation === 'date-time' ? format(testNOUTC, 'dd/MM/yyyy hh:mm aa') : format(testNOUTC, 'dd/MM/yyyy');
        // console.log("🚀 ~ file: calendar-input.page.ts:42 ~ CalendarInputPage ~ ngOnChanges ~ testNOUTCDisplay:", testNOUTCDisplay)

        if (this.presentation === 'date-time') {
          this.date_value_here = new Date(Date.UTC(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.date_value.getHours(), this.date_value.getMinutes(), 0));
        } else {
          this.date_value_here = new Date(Date.UTC(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), 0, 0, 0));
        }
        this.date_display = this.presentation === 'date-time' ? format(this.date_value, 'dd/MM/yyyy hh:mm aa') : format(this.date_value, 'dd/MM/yyyy');
      }
    }
  }

  ngOnInit() {
    this.today = new Date(Date.UTC(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), 0, 0, 0));
  }

  // Toggle date from
  toggleDate() {
    this.date_active = this.date_active ? false : true;
  }

  // On date from select
  onDateSelect(event: any) {
    let date = new Date(event.detail.value);
    this.date_active = false
    if (this.presentation === 'date-time') {
      this.date_value_here = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), 0));
    } else {
      this.date_value_here = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    }
    this.date_value = date;
    this.date_display = this.presentation === 'date-time' ? format(date, 'dd/MM/yyyy hh:mm aa') : format(date, 'dd/MM/yyyy');
    this.onDateSelected.emit(this.date_value);
  }

  resetControl() {
    this.date_active = false;
    this.defaultDate = new Date();
    if (this.presentation === 'date-time') {
      this.date_value_here = new Date(Date.UTC(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), this.defaultDate.getHours(), this.defaultDate.getMinutes(), 0));
    } else {
      this.date_value_here = new Date(Date.UTC(this.defaultDate.getFullYear(), this.defaultDate.getMonth(), this.defaultDate.getDate(), 0, 0, 0));
    }
    this.date_value = this.defaultDate;
    this.date_display = this.presentation === 'date-time' ? format(this.defaultDate, 'dd/MM/yyyy hh:mm aa') : format(this.defaultDate, 'dd/MM/yyyy');
    this.onDateSelected.emit(this.date_value);
  }
  
}
