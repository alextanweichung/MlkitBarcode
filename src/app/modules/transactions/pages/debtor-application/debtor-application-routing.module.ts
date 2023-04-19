import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebtorApplicationPage } from './debtor-application.page';

const routes: Routes = [
  {
    path: '',
    component: DebtorApplicationPage
  },
  {
    path: 'debtor-application-detail',
    loadChildren: () => import('./debtor-application-detail/debtor-application-detail.module').then( m => m.DebtorApplicationDetailPageModule)
  },
  {
    path: 'debtor-application-add',
    loadChildren: () => import('./debtor-application-add/debtor-application-add.module').then( m => m.DebtorApplicationAddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebtorApplicationPageRoutingModule {}
