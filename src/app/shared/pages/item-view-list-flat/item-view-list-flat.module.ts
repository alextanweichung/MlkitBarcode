import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemViewListFlatPageRoutingModule } from './item-view-list-flat-routing.module';

import { ItemViewListFlatPage } from './item-view-list-flat.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemViewListFlatPageRoutingModule,
    IdMappingModule
  ],
  exports: [
    ItemViewListFlatPage
  ],
  declarations: [ItemViewListFlatPage]
})
export class ItemViewListFlatPageModule {}
