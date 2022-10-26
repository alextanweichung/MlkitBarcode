import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemAddListPage } from './item-add-list.page';

const routes: Routes = [
  {
    path: '',
    component: ItemAddListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemAddListPageRoutingModule {}
