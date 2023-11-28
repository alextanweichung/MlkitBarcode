import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferBinPage } from './transfer-bin.page';

const routes: Routes = [
  {
    path: '',
    component: TransferBinPage
  },  {
    path: 'transfer-bin-detail',
    loadChildren: () => import('./transfer-bin-detail/transfer-bin-detail.module').then( m => m.TransferBinDetailPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBinPageRoutingModule {}
