import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountSummaryPage } from './stock-count-summary.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountSummaryPageRoutingModule {}
