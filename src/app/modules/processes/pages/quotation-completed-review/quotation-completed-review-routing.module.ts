import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationCompletedReviewPage } from './quotation-completed-review.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationCompletedReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationCompletedReviewPageRoutingModule {}
