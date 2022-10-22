import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmationPageRoutingModule } from './confirmation-routing.module';

import { ConfirmationPage } from './confirmation.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { ItemCartPageModule } from 'src/app/shared/pages/item-cart/item-cart.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmationPageRoutingModule,
    SumModule,
    ItemCartPageModule
  ],
  declarations: [ConfirmationPage]
})
export class ConfirmationPageModule {}
