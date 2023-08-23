import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InboundScanPage } from './inbound-scan.page';

const routes: Routes = [
  {
    path: '',
    component: InboundScanPage
  },
  {
    path: 'inbound-scan-detail',
    loadChildren: () => import('./inbound-scan-detail/inbound-scan-detail.module').then( m => m.InboundScanDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboundScanPageRoutingModule {}
