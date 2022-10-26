import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderPageRoutingModule } from './sales-order-routing.module';

import { SalesOrderPage } from './sales-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderPageRoutingModule
  ],
  declarations: [SalesOrderPage]
})
export class SalesOrderPageModule {}
