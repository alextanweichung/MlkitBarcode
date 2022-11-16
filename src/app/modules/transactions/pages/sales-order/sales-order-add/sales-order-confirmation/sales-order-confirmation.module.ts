import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderConfirmationPageRoutingModule } from './sales-order-confirmation-routing.module';

import { SalesOrderConfirmationPage } from './sales-order-confirmation.page';
import { ItemCartPageModule } from 'src/app/shared/pages/item-cart/item-cart.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderConfirmationPageRoutingModule,
    ItemCartPageModule
  ],
  declarations: [SalesOrderConfirmationPage]
})
export class SalesOrderConfirmationPageModule {}
