import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInPageRoutingModule } from './transfer-in-routing.module';

import { TransferInPage } from './transfer-in.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInPageRoutingModule
  ],
  declarations: [TransferInPage]
})
export class TransferInPageModule {}
