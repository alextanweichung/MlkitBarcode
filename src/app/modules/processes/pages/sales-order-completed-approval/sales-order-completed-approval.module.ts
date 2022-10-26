import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderCompletedApprovalPageRoutingModule } from './sales-order-completed-routing.module';

import { SalesOrderCompletedApprovalPage } from './sales-order-completed-approval.page';
import { TransactionProcessingPageModule } from 'src/app/shared/pages/transaction-processing/transaction-processing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderCompletedApprovalPageRoutingModule,
    TransactionProcessingPageModule
  ],
  declarations: [SalesOrderCompletedApprovalPage]
})
export class SalesOrderCompletedPageModule {}
