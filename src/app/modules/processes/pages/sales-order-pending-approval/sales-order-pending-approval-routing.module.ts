import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderPendingApproval } from './sales-order-pending-approval.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderPendingApproval
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderPendingPageRoutingModule {}