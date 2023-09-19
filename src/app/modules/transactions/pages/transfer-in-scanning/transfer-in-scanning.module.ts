import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInScanningPageRoutingModule } from './transfer-in-scanning-routing.module';

import { TransferInScanningPage } from './transfer-in-scanning.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInScanningPageRoutingModule
  ],
  declarations: [TransferInScanningPage]
})
export class TransferInScanningPageModule {}
