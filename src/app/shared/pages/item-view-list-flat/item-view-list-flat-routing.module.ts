import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemViewListFlatPage } from './item-view-list-flat.page';

const routes: Routes = [
  {
    path: '',
    component: ItemViewListFlatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemViewListFlatPageRoutingModule {}
