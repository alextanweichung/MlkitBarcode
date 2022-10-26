import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderCompletedApprovalPage } from './sales-order-completed-approval.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderCompletedApprovalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderCompletedApprovalPageRoutingModule {}
