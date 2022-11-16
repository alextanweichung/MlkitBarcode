import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountPage } from './stock-count.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountPage
  },
  {
    path: 'stock-count-add/stock-count-header',
    loadChildren: () => import('./stock-count-add/stock-count-header/stock-count-header.module').then( m => m.StockCountHeaderPageModule)
  },
  {
    path: 'stock-count-add/stock-count-item',
    loadChildren: () => import('./stock-count-add/stock-count-item/stock-count-item.module').then( m => m.StockCountItemPageModule)
  },
  {
    path: 'stock-count-add/stock-count-summary',
    loadChildren: () => import('./stock-count-add/stock-count-summary/stock-count-summary.module').then( m => m.StockCountSummaryPageModule)
  },
  {
    path: 'stock-count-edit/stock-count-header',
    loadChildren: () => import('./stock-count-edit/stock-count-header/stock-count-header.module').then( m => m.StockCountHeaderPageModule)
  },
  {
    path: 'stock-count-edit/stock-count-item',
    loadChildren: () => import('./stock-count-edit/stock-count-item/stock-count-item.module').then( m => m.StockCountItemPageModule)
  },
  {
    path: 'stock-count-edit/stock-count-summary',
    loadChildren: () => import('./stock-count-edit/stock-count-summary/stock-count-summary.module').then( m => m.StockCountSummaryPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountPageRoutingModule {}
