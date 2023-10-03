import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboundScanItemPageRoutingModule } from './inbound-scan-item-routing.module';

import { InboundScanItemPage } from './inbound-scan-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InboundScanItemPageRoutingModule,
    BarcodeScanInputPageModule
  ],
  declarations: [InboundScanItemPage]
})
export class InboundScanItemPageModule {}