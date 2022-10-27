import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingPage } from './picking.page';

const routes: Routes = [
  {
    path: '',
    component: PickingPage
  },
  {
    path: 'picking-sales-order',
    loadChildren: () => import('./picking-add/sales-order/sales-order.module').then( m => m.SalesOrderPageModule)
  },
  {
    path: 'picking-item',
    loadChildren: () => import('./picking-add/item/item.module').then( m => m.ItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingPageRoutingModule {}
