import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInAddPage } from './transfer-in-add.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInAddPageRoutingModule {}
