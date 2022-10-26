import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationPendingApprovalPage } from './quotation-pending-approval.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationPendingApprovalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationPendingApprovalPageRoutingModule {}
