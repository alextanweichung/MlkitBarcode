import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutEditPageRoutingModule } from './transfer-out-edit-routing.module';

import { TransferOutEditPage } from './transfer-out-edit.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferOutEditPageRoutingModule,
    SearchDropdownPageModule,
    CalendarInputPageModule,
    ReactiveFormsModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule
  ],
  declarations: [TransferOutEditPage]
})
export class TransferOutEditPageModule {}
