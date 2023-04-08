import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RpSaPerfAllPage } from './rp-sa-perf-all.page';

const routes: Routes = [
  {
    path: '',
    component: RpSaPerfAllPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RpSaPerfAllPageRoutingModule {}
