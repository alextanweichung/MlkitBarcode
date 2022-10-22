import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemPageRoutingModule } from './item-routing.module';

import { ItemPage } from './item.page';
import { ListingSkeletonPageModule } from 'src/app/shared/pages/listing-skeleton/listing-skeleton.module';
import { ItemAddGridPageModule } from 'src/app/shared/pages/item-add-grid/item-add-grid.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemPageRoutingModule,
    ListingSkeletonPageModule,
    ItemAddGridPageModule
  ],
  declarations: [ItemPage]
})
export class ItemPageModule {}
