import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderPendingReviewPage } from './sales-order-pending-review.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderPendingReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderPendingReviewPageRoutingModule {}
