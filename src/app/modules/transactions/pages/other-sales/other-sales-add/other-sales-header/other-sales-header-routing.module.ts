import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherSalesHeaderPage } from './other-sales-header.page';

const routes: Routes = [
  {
    path: '',
    component: OtherSalesHeaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherSalesHeaderPageRoutingModule {}
