import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherSalesPage } from './other-sales.page';

const routes: Routes = [
  {
    path: '',
    component: OtherSalesPage
  },
  {
    path: 'other-sales-header',
    loadChildren: () => import('./other-sales-add/other-sales-header/other-sales-header.module').then( m => m.OtherSalesHeaderPageModule)
  },
  {
    path: 'other-sales-item',
    loadChildren: () => import('./other-sales-add/other-sales-item/other-sales-item.module').then( m => m.OtherSalesItemPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherSalesPageRoutingModule {}
