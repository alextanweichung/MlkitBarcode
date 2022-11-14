import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailPageRoutingModule } from './detail-routing.module';

import { DetailPage } from './detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { ItemViewListFlatPageModule } from 'src/app/shared/pages/item-view-list-flat/item-view-list-flat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailPageRoutingModule,
    IdMappingModule,
    ItemViewListFlatPageModule
  ],
  declarations: [DetailPage]
})
export class DetailPageModule {}
