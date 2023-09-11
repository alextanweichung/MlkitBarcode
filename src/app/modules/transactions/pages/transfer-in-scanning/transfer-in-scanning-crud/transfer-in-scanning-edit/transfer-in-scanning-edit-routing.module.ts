import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInScanningEditPage } from './transfer-in-scanning-edit.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInScanningEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInScanningEditPageRoutingModule {}
