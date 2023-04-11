import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterTransferCartPageRoutingModule } from './inter-transfer-cart-routing.module';

import { InterTransferCartPage } from './inter-transfer-cart.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterTransferCartPageRoutingModule
  ],
  declarations: [InterTransferCartPage]
})
export class InterTransferCartPageModule {}
