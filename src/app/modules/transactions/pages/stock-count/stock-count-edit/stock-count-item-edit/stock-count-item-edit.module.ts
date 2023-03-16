import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountItemEditPageRoutingModule } from './stock-count-item-edit-routing.module';

import { StockCountItemEditPage } from './stock-count-item-edit.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountItemEditPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule,
    CameraScanInputPageModule
  ],
  declarations: [StockCountItemEditPage]
})
export class StockCountItemEditPageModule {}
