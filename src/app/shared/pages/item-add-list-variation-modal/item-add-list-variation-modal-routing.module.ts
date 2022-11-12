import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemAddListVariationModalPage } from './item-add-list-variation-modal.page';


const routes: Routes = [
  {
    path: '',
    component: ItemAddListVariationModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemAddListVariationModalPageRoutingModule {}
