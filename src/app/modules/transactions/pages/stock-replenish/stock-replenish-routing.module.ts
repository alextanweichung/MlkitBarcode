import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockReplenishPage } from './stock-replenish.page';

const routes: Routes = [
  {
    path: '',
    component: StockReplenishPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockReplenishPageRoutingModule {}
