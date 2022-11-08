import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountPage } from './stock-count.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountPage
  },
  {
    path: 'stock-count-header',
    loadChildren: () => import('./stock-count-add/stock-count-header/stock-count-header.module').then( m => m.StockCountHeaderPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountPageRoutingModule {}
