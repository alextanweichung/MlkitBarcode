import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReorderPage } from './stock-reorder.page';

const routes: Routes = [
  {
    path: '',
    component: StockReorderPage
  },
  {
    path: 'stock-reorder-detail',
    loadChildren: () => import('./stock-reorder-detail/stock-reorder-detail.module').then( m => m.StockReorderDetailPageModule)
  },
  {
    path: 'stock-reorder-add',
    loadChildren: () => import('./stock-reorder-crud/stock-reorder-add/stock-reorder-add.module').then( m => m.StockReorderAddPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReorderPageRoutingModule {}
