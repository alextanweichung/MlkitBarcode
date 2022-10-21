import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuotationPage } from './quotation.page';

const routes: Routes = [
  {
    path: '',
    component: QuotationPage
  },
  {
    path: 'quotation-customer',
    loadChildren: () => import('./quotation-add/customer/customer.module').then(m => m.CustomerPageModule)
  },
  {
    path: 'quotation-item',
    loadChildren: () => import('./quotation-add/item/item.module').then(m => m.ItemPageModule)
  },
  {
    path: 'quotation-confirmation',
    loadChildren: () => import('./quotation-add/confirmation/confirmation.module').then(m => m.ConfirmationPageModule)
  },
  {
    path: 'quotation-summary',
    loadChildren: () => import('./quotation-add/summary/summary.module').then(m => m.SummaryPageModule)
  },
  {
    path: 'quotation-detail',
    loadChildren: () => import('./quotation-detail/detail/detail.module').then( m => m.DetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuotationPageRoutingModule {}
