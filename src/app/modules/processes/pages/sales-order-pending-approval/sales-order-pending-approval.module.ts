import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderPendingPageRoutingModule } from './sales-order-pending-approval-routing.module';

import { SalesOrderPendingApproval } from './sales-order-pending-approval.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderPendingPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SalesOrderPendingApproval]
})
export class SalesOrderPendingPageModule {}
