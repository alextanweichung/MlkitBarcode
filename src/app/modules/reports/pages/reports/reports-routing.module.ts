import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsPage } from './reports.page';

const routes: Routes = [
  {
    path: '',
    component: ReportsPage
  },  {
    path: 'debtor-latest-outstanding',
    loadChildren: () => import('./debtor-latest-outstanding/debtor-latest-outstanding.module').then( m => m.DebtorLatestOutstandingPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsPageRoutingModule {}
