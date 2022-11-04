import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingSalesOrderPage } from './picking-sales-order.page';

const routes: Routes = [
  {
    path: '',
    component: PickingSalesOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingSalesOrderPageRoutingModule {}
