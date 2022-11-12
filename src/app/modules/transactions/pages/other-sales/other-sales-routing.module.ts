import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherSalesPage } from './other-sales.page';

const routes: Routes = [
  {
    path: '',
    component: OtherSalesPage
  },
  {
    path: 'other-sales-add/other-sales-header',
    loadChildren: () => import('./other-sales-add/other-sales-header/other-sales-header.module').then( m => m.OtherSalesHeaderPageModule)
  },
  {
    path: 'other-sales-detail',
    loadChildren: () => import('./other-sales-detail/other-sales-detail.module').then( m => m.OtherSalesDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherSalesPageRoutingModule {}
