import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountItemPageRoutingModule } from './stock-count-item-routing.module';

import { StockCountItemPage } from './stock-count-item.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountItemPageRoutingModule,
    IdMappingModule,
    BarcodeScanInputPageModule
  ],
  declarations: [StockCountItemPage]
})
export class StockCountItemPageModule {}
