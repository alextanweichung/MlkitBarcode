import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferOutEditPage } from './transfer-out-edit.page';

const routes: Routes = [
  {
    path: '',
    component: TransferOutEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferOutEditPageRoutingModule {}
