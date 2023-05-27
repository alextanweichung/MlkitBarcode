import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderCartPageRoutingModule } from './sales-order-cart-routing.module';

import { SalesOrderCartPage } from './sales-order-cart.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderCartPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [SalesOrderCartPage]
})
export class SalesOrderCartPageModule {}
