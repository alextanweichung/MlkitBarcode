import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherSalesItemPage } from './other-sales-item.page';

const routes: Routes = [
  {
    path: '',
    component: OtherSalesItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherSalesItemPageRoutingModule {}
