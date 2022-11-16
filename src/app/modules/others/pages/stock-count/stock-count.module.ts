import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountPageRoutingModule } from './stock-count-routing.module';

import { StockCountPage } from './stock-count.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountPageRoutingModule,
    IdMappingModule
  ],
  declarations: [StockCountPage]
})
export class StockCountPageModule {}
