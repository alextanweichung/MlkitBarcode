import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountHeaderEditPageRoutingModule } from './stock-count-header-edit-routing.module';

import { StockCountHeaderEditPage } from './stock-count-header-edit.page';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountHeaderEditPageRoutingModule,
    CalendarInputPageModule,
    SearchDropdownPageModule,
    IdMappingModule
  ],
  declarations: [StockCountHeaderEditPage]
})
export class StockCountHeaderEditPageModule {}
