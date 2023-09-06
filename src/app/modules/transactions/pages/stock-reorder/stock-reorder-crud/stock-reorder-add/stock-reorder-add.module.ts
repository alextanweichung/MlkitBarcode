import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReorderAddPageRoutingModule } from './stock-reorder-add-routing.module';

import { StockReorderAddPage } from './stock-reorder-add.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReorderAddPageRoutingModule,
    SearchDropdownPageModule,
    CalendarInputPageModule,
    ReactiveFormsModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule
  ],
  declarations: [StockReorderAddPage]
})
export class StockReorderAddPageModule {}
