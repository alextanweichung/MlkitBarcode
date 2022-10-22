import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemAddGridPage } from './item-add-grid.page';

const routes: Routes = [
  {
    path: '',
    component: ItemAddGridPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemAddGridPageRoutingModule {}
