import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationCompletedReviewPageRoutingModule } from './quotation-completed-review-routing.module';

import { QuotationCompletedReviewPage } from './quotation-completed-review.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationCompletedReviewPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [QuotationCompletedReviewPage]
})
export class QuotationCompletedReviewPageModule {}
