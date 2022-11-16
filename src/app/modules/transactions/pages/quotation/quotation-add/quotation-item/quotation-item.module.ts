import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationItemPageRoutingModule } from './quotation-item-routing.module';

import { QuotationItemPage } from './quotation-item.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';
import { ItemAddGridVariationMPageModule } from 'src/app/shared/pages/item-add-grid-variation-modal/item-add-grid-variation-modal.module';
import { ItemAddListWithVariationPageModule } from 'src/app/shared/pages/item-add-list-variation-modal/item-add-list-variation-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationItemPageRoutingModule,
    ListingSkeletonPageModule,
    ItemAddGridVariationMPageModule,
    ItemAddListWithVariationPageModule
  ],
  declarations: [QuotationItemPage]
})
export class QuotationItemPageModule {}
