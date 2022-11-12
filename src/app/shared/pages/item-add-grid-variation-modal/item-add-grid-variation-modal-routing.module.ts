import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemAddGridVariationMPage } from './item-add-grid-variation-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ItemAddGridVariationMPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemAddGridVariationMPageRoutingModule {}
