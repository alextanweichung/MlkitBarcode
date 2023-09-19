import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutAddPageRoutingModule } from './transfer-out-add-routing.module';

import { TransferOutAddPage } from './transfer-out-add.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferOutAddPageRoutingModule,
    SearchDropdownPageModule,
    CalendarInputPageModule,
    ReactiveFormsModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule
  ],
  declarations: [TransferOutAddPage]
})
export class TransferOutAddPageModule {}
