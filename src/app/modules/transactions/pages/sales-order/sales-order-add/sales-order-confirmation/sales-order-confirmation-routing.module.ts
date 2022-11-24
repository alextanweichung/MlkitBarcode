import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesOrderConfirmationPage } from './sales-order-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderConfirmationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesOrderConfirmationPageRoutingModule {}
