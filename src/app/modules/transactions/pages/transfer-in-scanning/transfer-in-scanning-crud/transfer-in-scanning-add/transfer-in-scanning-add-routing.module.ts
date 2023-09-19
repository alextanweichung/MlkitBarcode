import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInScanningAddPage } from './transfer-in-scanning-add.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInScanningAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInScanningAddPageRoutingModule {}
