import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingPage } from './packing.page';

const routes: Routes = [
  {
    path: '',
    component: PackingPage
  },
  {
    path: 'packing-sales-order',
    loadChildren: () => import('./packing-add/packing-sales-order/packing-sales-order.module').then( m => m.PackingSalesOrderPageModule)
  },
  {
    path: 'packing-item',
    loadChildren: () => import('./packing-add/packing-item/packing-item.module').then( m => m.PackingItemPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingPageRoutingModule {}
