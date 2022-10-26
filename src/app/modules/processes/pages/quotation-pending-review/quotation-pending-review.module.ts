import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationPendingReviewPageRoutingModule } from './quotation-pending-review-routing.module';

import { QuotationPendingReviewPage } from './quotation-pending-review.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationPendingReviewPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [QuotationPendingReviewPage]
})
export class QuotationPendingReviewPageModule {}
