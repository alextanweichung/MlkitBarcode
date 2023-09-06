import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInAddPageRoutingModule } from './transfer-in-add-routing.module';

import { TransferInAddPage } from './transfer-in-add.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInAddPageRoutingModule,
    SearchDropdownPageModule,
    CalendarInputPageModule,
    ReactiveFormsModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule,
    IdMappingModule
  ],
  declarations: [TransferInAddPage]
})
export class TransferInAddPageModule {}
