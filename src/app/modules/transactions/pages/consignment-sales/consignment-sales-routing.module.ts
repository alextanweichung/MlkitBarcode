import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesPage } from './consignment-sales.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesPage
  },
  {
    path: 'consignment-sales-header-add',
    loadChildren: () => import('./consignment-sales-add/consignment-sales-header-add/consignment-sales-header-add.module').then( m => m.ConsignmentSalesHeaderAddPageModule)
  },
  {
    path: 'consignment-sales-item-add',
    loadChildren: () => import('./consignment-sales-add/consignment-sales-item-add/consignment-sales-item-add.module').then( m => m.ConsignmentSalesItemAddPageModule)
  },
  {
    path: 'consignment-sales-item-edit',
    loadChildren: () => import('./consignment-sales-edit/consignment-sales-item-edit/consignment-sales-item-edit.module').then( m => m.ConsignmentSalesItemEditPageModule)
  },
  {
    path: 'consignment-sales-summary',
    loadChildren: () => import('./consignment-sales-add/consignment-sales-summary/consignment-sales-summary.module').then( m => m.ConsignmentSalesSummaryPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesPageRoutingModule {}
