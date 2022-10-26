import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderCompletedReviewPageRoutingModule } from './sales-order-completed-review-routing.module';

import { SalesOrderCompletedReviewPage } from './sales-order-completed-review.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderCompletedReviewPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SalesOrderCompletedReviewPage]
})
export class SalesOrderCompletedReviewPageModule {}
