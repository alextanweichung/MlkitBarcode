import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboundScanPageRoutingModule } from './inbound-scan-routing.module';

import { InboundScanPage } from './inbound-scan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InboundScanPageRoutingModule
  ],
  declarations: [InboundScanPage]
})
export class InboundScanPageModule {}
