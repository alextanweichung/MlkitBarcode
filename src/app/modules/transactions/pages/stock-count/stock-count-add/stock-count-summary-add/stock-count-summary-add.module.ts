import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountSummaryAddPageRoutingModule } from './stock-count-summary-add-routing.module';

import { StockCountSummaryAddPage } from './stock-count-summary-add.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountSummaryAddPageRoutingModule,
    IdMappingModule
  ],
  declarations: [StockCountSummaryAddPage]
})
export class StockCountSummaryAddPageModule {}
