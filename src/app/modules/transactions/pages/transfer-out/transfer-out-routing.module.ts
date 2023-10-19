import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferOutPage } from './transfer-out.page';

const routes: Routes = [
  {
    path: '',
    component: TransferOutPage
  },
  {
    path: 'transfer-out-detail',
    loadChildren: () => import('./transfer-out-detail/transfer-out-detail.module').then( m => m.TransferOutDetailPageModule)
  },
  {
    path: 'transfer-out-add',
    loadChildren: () => import('./transfer-out-crud/transfer-out-add/transfer-out-add.module').then( m => m.TransferOutAddPageModule)
  },
  {
    path: 'transfer-out-item',
    loadChildren: () => import('./transfer-out-crud/transfer-out-item/transfer-out-item.module').then( m => m.TransferOutItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferOutPageRoutingModule {}
