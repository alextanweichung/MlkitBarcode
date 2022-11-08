import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountPage } from './stock-count.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountPageRoutingModule {}
