import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferOutAddPage } from './transfer-out-add.page';

const routes: Routes = [
  {
    path: '',
    component: TransferOutAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferOutAddPageRoutingModule {}
