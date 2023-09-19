import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReorderAddPage } from './stock-reorder-add.page';

const routes: Routes = [
  {
    path: '',
    component: StockReorderAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReorderAddPageRoutingModule {}
