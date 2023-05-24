import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationSummaryPageRoutingModule } from './quotation-summary-routing.module';

import { QuotationSummaryPage } from './quotation-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationSummaryPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [QuotationSummaryPage]
})
export class QuotationSummaryPageModule {}
