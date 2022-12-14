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
    loadChildren: () => import('./stock-count-add/stock-count-header-add/stock-count-header-add.module').then( m => m.StockCountHeaderAddPageModule)
  },
  {
    path: 'stock-count-add/stock-count-item',
    loadChildren: () => import('./stock-count-add/stock-count-item-add/stock-count-item-add.module').then( m => m.StockCountItemAddPageModule)
  },
  {
    path: 'stock-count-add/stock-count-summary',
    loadChildren: () => import('./stock-count-add/stock-count-summary-add/stock-count-summary-add.module').then( m => m.StockCountSummaryAddPageModule)
  },
  {
    path: 'stock-count-edit/stock-count-header',
    loadChildren: () => import('./stock-count-edit/stock-count-header-edit/stock-count-header-edit.module').then( m => m.StockCountHeaderEditPageModule)
  },
  {
    path: 'stock-count-edit/stock-count-item',
    loadChildren: () => import('./stock-count-edit/stock-count-item-edit/stock-count-item-edit.module').then( m => m.StockCountItemEditPageModule)
  },
  {
    path: 'stock-count-edit/stock-count-summary',
    loadChildren: () => import('./stock-count-edit/stock-count-summary-edit/stock-count-summary-edit.module').then( m => m.StockCountSummaryEditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountPageRoutingModule {}
