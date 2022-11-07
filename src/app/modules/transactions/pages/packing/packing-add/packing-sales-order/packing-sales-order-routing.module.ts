import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingSalesOrderPage } from './packing-sales-order.page';

const routes: Routes = [
  {
    path: '',
    component: PackingSalesOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingSalesOrderPageRoutingModule {}
