import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpSaPerformanceListingPage } from './rp-sa-performance-listing.page';

const routes: Routes = [
  {
    path: '',
    component: RpSaPerformanceListingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpSaPerformanceListingPageRoutingModule {}
