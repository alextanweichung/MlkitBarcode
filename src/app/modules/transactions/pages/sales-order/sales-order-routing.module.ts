import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingSalesOrderPage } from './sales-order.page';

const routes: Routes = [
  {
    path: '',
    component: PickingSalesOrderPage
  },
  {
    path: 'sales-order-customer',
    loadChildren: () => import('./sales-order-add/customer/customer.module').then( m => m.CustomerPageModule)
  },
  {
    path: 'sales-order-item',
    loadChildren: () => import('./sales-order-add/item/item.module').then( m => m.ItemPageModule)
  },
  {
    path: 'sales-order-confirmation',
    loadChildren: () => import('./sales-order-add/confirmation/confirmation.module').then( m => m.ConfirmationPageModule)
  },
  {
    path: 'sales-order-summary',
    loadChildren: () => import('./sales-order-add/summary/summary.module').then( m => m.SummaryPageModule)
  },
  {
    path: 'sales-order-detail',
    loadChildren: () => import('./sales-order-detail/detail/detail.module').then( m => m.DetailPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderPageRoutingModule {}
