import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesHeaderAddPageRoutingModule } from './consignment-sales-header-add-routing.module';

import { ConsignmentSalesHeaderAddPage } from './consignment-sales-header-add.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesHeaderAddPageRoutingModule,
    CalendarInputPageModule,
    SearchDropdownPageModule
  ],
  declarations: [ConsignmentSalesHeaderAddPage]
})
export class ConsignmentSalesHeaderAddPageModule {}
