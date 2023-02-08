import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemCodeInputOfflinePage } from './item-code-input-offline.page';

const routes: Routes = [
  {
    path: '',
    component: ItemCodeInputOfflinePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemCodeInputOfflinePageRoutingModule {}
