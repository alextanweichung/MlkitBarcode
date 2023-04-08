import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSaPerfAllPageRoutingModule } from './rp-sa-perf-all-routing.module';

import { RpSaPerfAllPage } from './rp-sa-perf-all.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CalendarInputPageModule } from '../shared/pages/calendar-input/calendar-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSaPerfAllPageRoutingModule,
    NgxDatatableModule,
    CalendarInputPageModule
  ],
  declarations: [RpSaPerfAllPage]
})
export class RpSaPerfAllPageModule {}
