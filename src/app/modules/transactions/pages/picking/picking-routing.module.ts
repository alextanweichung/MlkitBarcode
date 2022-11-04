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
    loadChildren: () => import('./picking-add/picking-sales-order/picking-sales-order.module').then( m => m.PickingSalesOrderPageModule)
  },
  {
    path: 'picking-item',
    loadChildren: () => import('./picking-add/picking-item/picking-item.module').then( m => m.PickingItemPageModule)
  },
  {
    path: 'picking-confirmation',
    loadChildren: () => import('./picking-add/picking-confirmation/picking-confirmation.module').then( m => m.PickingConfirmationPageModule)
  },  {
    path: 'picking-summary',
    loadChildren: () => import('./picking-add/picking-summary/picking-summary.module').then( m => m.PickingSummaryPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingPageRoutingModule {}
