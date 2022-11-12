import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemPageRoutingModule } from './item-routing.module';

import { ItemPage } from './item.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';
import { ItemAddGridVariationMPageModule } from 'src/app/shared/pages/item-add-grid-variation-modal/item-add-grid-variation-modal.module';
import { ItemAddListWithVariationPageModule } from 'src/app/shared/pages/item-add-list-variation-modal/item-add-list-variation-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemPageRoutingModule,
    ListingSkeletonPageModule,
    ItemAddGridVariationMPageModule,
    ItemAddListWithVariationPageModule
  ],
  declarations: [ItemPage]
})
export class ItemPageModule {}
