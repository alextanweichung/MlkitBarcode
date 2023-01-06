import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountItemAddPage } from './stock-count-item-add.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountItemAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountItemAddPageRoutingModule {}
