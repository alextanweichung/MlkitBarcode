import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountItemEditPage } from './stock-count-item-edit.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountItemEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountItemEditPageRoutingModule {}
