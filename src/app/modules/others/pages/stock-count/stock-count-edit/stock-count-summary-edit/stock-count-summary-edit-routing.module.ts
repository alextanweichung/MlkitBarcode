import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountSummaryEditPage } from './stock-count-summary-edit.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountSummaryEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountSummaryEditPageRoutingModule {}
