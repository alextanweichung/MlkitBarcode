import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCatalogWithoutPricePageRoutingModule } from './item-catalog-without-price-routing.module';

import { ItemCatalogWithoutPricePage } from './item-catalog-without-price.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemCatalogWithoutPricePageRoutingModule
  ],
  exports:[
    ItemCatalogWithoutPricePage
  ],
  declarations: [ItemCatalogWithoutPricePage]
})
export class ItemCatalogWithoutPricePageModule {}
