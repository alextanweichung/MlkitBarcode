import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountSummaryPageRoutingModule } from './stock-count-summary-routing.module';

import { StockCountSummaryPage } from './stock-count-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountSummaryPageRoutingModule,
    IdMappingModule
  ],
  declarations: [StockCountSummaryPage]
})
export class StockCountSummaryPageModule {}
