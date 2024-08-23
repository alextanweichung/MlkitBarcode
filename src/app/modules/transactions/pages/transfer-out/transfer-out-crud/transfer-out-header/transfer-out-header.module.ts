import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutHeaderPageRoutingModule } from './transfer-out-header-routing.module';

import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { TransferOutHeaderPage } from './transfer-out-header.page';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      TransferOutHeaderPageRoutingModule,
      SearchDropdownPageModule,
      CalendarInputPageModule,
      ReactiveFormsModule,
      BarcodeScanInputPageModule
   ],
   declarations: [TransferOutHeaderPage]
})
export class TransferOutHeaderPageModule { }
