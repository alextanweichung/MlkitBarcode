import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpSalesPerformancePage } from './rp-sales-performance';

const routes: Routes = [
  {
    path: '',
    component: RpSalesPerformancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpSalesPerformancePageRoutingModule {}
