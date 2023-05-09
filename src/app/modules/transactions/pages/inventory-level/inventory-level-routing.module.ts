import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryLevelPage } from './inventory-level.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryLevelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryLevelPageRoutingModule {}
