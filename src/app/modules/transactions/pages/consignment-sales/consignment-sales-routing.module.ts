import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesPage } from './consignment-sales.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesPage
  },
  {
    path: 'consignment-sales-header',
    loadChildren: () => import('./consignment-sales-add/consignment-sales-header/consignment-sales-header.module').then( m => m.ConsignmentSalesHeaderPageModule)
  },
  {
    path: 'consignment-sales-item',
    loadChildren: () => import('./consignment-sales-add/consignment-sales-item/consignment-sales-item.module').then( m => m.ConsignmentSalesItemPageModule)
  },  {
    path: 'consignment-sales-summary',
    loadChildren: () => import('./consignment-sales-add/consignment-sales-summary/consignment-sales-summary.module').then( m => m.ConsignmentSalesSummaryPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesPageRoutingModule {}
