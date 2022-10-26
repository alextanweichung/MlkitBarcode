import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationCompletedApprovalPage } from './quotation-completed-approval.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationCompletedApprovalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationCompletedApprovalPageRoutingModule {}
