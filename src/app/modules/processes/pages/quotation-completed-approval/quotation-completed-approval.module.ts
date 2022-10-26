import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationCompletedApprovalPageRoutingModule } from './quotation-completed-approval-routing.module';

import { QuotationCompletedApprovalPage } from './quotation-completed-approval.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationCompletedApprovalPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [QuotationCompletedApprovalPage]
})
export class QuotationCompletedApprovalPageModule {}
