import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderCompletedReviewPage } from './sales-order-completed-review.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderCompletedReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderCompletedReviewPageRoutingModule {}
