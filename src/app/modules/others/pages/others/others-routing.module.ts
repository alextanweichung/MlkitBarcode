import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OthersPage } from './others.page';

const routes: Routes = [
  {
    path: '',
    component: OthersPage
  },
  {
    path: 'check-balance',
    loadChildren: () => import('../check-balance/check-balance.module').then( m => m.CheckBalancePageModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OthersPageRoutingModule {}
