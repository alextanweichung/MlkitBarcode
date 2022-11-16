import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherSalesDetailPage } from './other-sales-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OtherSalesDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherSalesDetailPageRoutingModule {}
