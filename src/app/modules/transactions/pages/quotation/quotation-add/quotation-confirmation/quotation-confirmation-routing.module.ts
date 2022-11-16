import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationConfirmationPage } from './quotation-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationConfirmationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationConfirmationPageRoutingModule {}
