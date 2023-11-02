import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundApprovalsPageRoutingModule } from './refund-approvals-routing.module';

import { RefundApprovalsPage } from './refund-approvals.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundApprovalsPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [RefundApprovalsPage]
})
export class RefundApprovalsPageModule {}
