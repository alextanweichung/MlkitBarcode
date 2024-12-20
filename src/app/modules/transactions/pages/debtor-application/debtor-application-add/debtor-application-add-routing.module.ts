import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebtorApplicationAddPage } from './debtor-application-add.page';

const routes: Routes = [
  {
    path: '',
    component: DebtorApplicationAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebtorApplicationAddPageRoutingModule {}
