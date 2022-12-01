import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsignmentSalesHeaderAddPage } from './consignment-sales-header-add.page';

const routes: Routes = [
  {
    path: '',
    component: ConsignmentSalesHeaderAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsignmentSalesHeaderAddPageRoutingModule {}
