import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountHeaderAddPageRoutingModule } from './stock-count-header-add-routing.module';

import { StockCountHeaderAddPage } from './stock-count-header-add.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountHeaderAddPageRoutingModule,
    CalendarInputPageModule,
    SearchDropdownPageModule
  ],
  declarations: [StockCountHeaderAddPage]
})
export class StockCountHeaderAddPageModule {}
