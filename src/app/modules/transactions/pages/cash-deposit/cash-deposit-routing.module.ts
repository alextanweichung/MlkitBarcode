import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashDepositPage } from './cash-deposit.page';

const routes: Routes = [
  {
    path: '',
    component: CashDepositPage
  },
  {
    path: 'cash-deposit-add',
    loadChildren: () => import('./cash-deposit-add/cash-deposit-add.module').then( m => m.CashDepositAddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashDepositPageRoutingModule {}
