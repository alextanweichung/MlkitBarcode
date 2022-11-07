import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingSummaryPage } from './packing-summary.page';

const routes: Routes = [
  {
    path: '',
    component: PackingSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingSummaryPageRoutingModule {}
