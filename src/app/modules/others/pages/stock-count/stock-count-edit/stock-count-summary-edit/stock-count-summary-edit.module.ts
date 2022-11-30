import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockCountSummaryEditPageRoutingModule } from './stock-count-summary-edit-routing.module';

import { StockCountSummaryEditPage } from './stock-count-summary-edit.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockCountSummaryEditPageRoutingModule,
    IdMappingModule
  ],
  declarations: [StockCountSummaryEditPage]
})
export class StockCountSummaryEditPageModule {}
