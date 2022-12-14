import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountItemAddPageRoutingModule } from './stock-count-item-add-routing.module';

import { StockCountItemAddPage } from './stock-count-item-add.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountItemAddPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule
  ],
  declarations: [StockCountItemAddPage]
})
export class StockCountItemAddPageModule {}
