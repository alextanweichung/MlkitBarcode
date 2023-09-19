import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferInScanningPage } from './transfer-in-scanning.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInScanningPage
  },
  {
    path: 'transfer-in-scanning-add',
    loadChildren: () => import('./transfer-in-scanning-crud/transfer-in-scanning-add/transfer-in-scanning-add.module').then( m => m.TransferInScanningAddPageModule)
  },
  {
    path: 'transfer-in-scanning-item',
    loadChildren: () => import('./transfer-in-scanning-crud/transfer-in-scanning-item/transfer-in-scanning-item.module').then( m => m.TransferInScanningItemPageModule)
  },
  {
    path: 'transfer-in-scanning-detail',
    loadChildren: () => import('./transfer-in-scanning-detail/transfer-in-scanning-detail.module').then( m => m.TransferInScanningDetailPageModule)
  },
  {
    path: 'transfer-in-scanning-edit',
    loadChildren: () => import('./transfer-in-scanning-crud/transfer-in-scanning-edit/transfer-in-scanning-edit.module').then( m => m.TransferInScanningEditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferInScanningPageRoutingModule {}
