import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesSummaryPage } from './consignment-sales-summary.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesSummaryPageRoutingModule {}
