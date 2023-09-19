import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferPageRoutingModule } from './inter-transfer-routing.module';

import { InterTransferPage } from './inter-transfer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferPageRoutingModule
  ],
  declarations: [InterTransferPage]
})
export class InterTransferPageModule {}
