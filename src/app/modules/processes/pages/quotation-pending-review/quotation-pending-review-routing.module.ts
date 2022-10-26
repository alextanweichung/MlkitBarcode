import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationPendingReviewPage } from './quotation-pending-review.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationPendingReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationPendingReviewPageRoutingModule {}
