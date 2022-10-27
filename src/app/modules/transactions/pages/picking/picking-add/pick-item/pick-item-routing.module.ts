import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickItemPage } from './pick-item.page';

const routes: Routes = [
  {
    path: '',
    component: PickItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemPageRoutingModule {}
