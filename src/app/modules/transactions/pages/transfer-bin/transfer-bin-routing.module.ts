import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferBinPage } from './transfer-bin.page';

const routes: Routes = [
  {
    path: '',
    component: TransferBinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBinPageRoutingModule {}
