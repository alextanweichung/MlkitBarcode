import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingSummaryPage } from './picking-summary.page';

const routes: Routes = [
  {
    path: '',
    component: PickingSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickingSummaryPageRoutingModule {}
