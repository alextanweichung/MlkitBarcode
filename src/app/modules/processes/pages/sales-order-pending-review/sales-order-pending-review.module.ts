import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderPendingReviewPageRoutingModule } from './sales-order-pending-review-routing.module';

import { SalesOrderPendingReviewPage } from './sales-order-pending-review.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderPendingReviewPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SalesOrderPendingReviewPage]
})
export class SalesOrderPendingReviewPageModule {}
