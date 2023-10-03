import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReorderDetailPageRoutingModule } from './stock-reorder-detail-routing.module';

import { StockReorderDetailPage } from './stock-reorder-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReorderDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [StockReorderDetailPage]
})
export class StockReorderDetailPageModule {}