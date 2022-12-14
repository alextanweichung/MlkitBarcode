import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesItemAddPage } from './consignment-sales-item-add.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesItemAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesItemAddPageRoutingModule {}
