import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtherSalesHeaderPageRoutingModule } from './other-sales-header-routing.module';

import { OtherSalesHeaderPage } from './other-sales-header.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtherSalesHeaderPageRoutingModule,
    CalendarInputPageModule,
    SearchDropdownPageModule
  ],
  declarations: [OtherSalesHeaderPage]
})
export class OtherSalesHeaderPageModule {}
