import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckBalancePage } from './check-balance.page';

const routes: Routes = [
  {
    path: '',
    component: CheckBalancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckBalancePageRoutingModule {}
