import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderItemPageRoutingModule } from './sales-order-item-routing.module';

import { SalesOrderItemPage } from './sales-order-item.page';
import { ItemAddGridVariationMPageModule } from 'src/app/shared/pages/item-add-grid-variation-modal/item-add-grid-variation-modal.module';
import { ItemAddListWithVariationPageModule } from 'src/app/shared/pages/item-add-list-variation-modal/item-add-list-variation-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderItemPageRoutingModule,
    ItemAddGridVariationMPageModule,
    ItemAddListWithVariationPageModule
  ],
  declarations: [SalesOrderItemPage]
})
export class SalesOrderItemPageModule {}
