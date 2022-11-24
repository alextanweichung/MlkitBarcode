import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationSummaryPageRoutingModule } from './quotation-summary-routing.module';

import { QuotationSummaryPage } from './quotation-summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationSummaryPageRoutingModule
  ],
  declarations: [QuotationSummaryPage]
})
export class QuotationSummaryPageModule {}
