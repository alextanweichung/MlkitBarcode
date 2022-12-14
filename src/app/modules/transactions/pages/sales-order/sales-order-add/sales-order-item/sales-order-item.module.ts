import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderItemPageRoutingModule } from './sales-order-item-routing.module';

import { SalesOrderItemPage } from './sales-order-item.page';
import { GeneralSalesGridPageModule } from 'src/app/shared/pages/general-sales-grid/general-sales-grid.module';
import { ItemAddListWithVariationPageModule } from 'src/app/shared/pages/general-sales/general-sales-list.module';
import { ItemCartPageModule } from 'src/app/shared/pages/item-cart/item-cart.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderItemPageRoutingModule,
    GeneralSalesGridPageModule,
    ItemAddListWithVariationPageModule,
    ItemCartPageModule,
    SumModule
  ],
  declarations: [SalesOrderItemPage]
})
export class SalesOrderItemPageModule {}
