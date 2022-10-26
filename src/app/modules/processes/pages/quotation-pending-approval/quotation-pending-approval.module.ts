import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationPendingApprovalPageRoutingModule } from './quotation-pending-approval-routing.module';

import { QuotationPendingApprovalPage } from './quotation-pending-approval.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationPendingApprovalPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [QuotationPendingApprovalPage]
})
export class QuotationPendingApprovalPageModule {}
