import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScanBarcodePageRoutingModule } from './scan-barcode-routing.module';

import { ScanBarcodePage } from './scan-barcode.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      ScanBarcodePageRoutingModule,
      BarcodeScanInputPageModule,
      IdMappingModule
   ],
   declarations: [ScanBarcodePage]
})
export class ScanBarcodePageModule { }
