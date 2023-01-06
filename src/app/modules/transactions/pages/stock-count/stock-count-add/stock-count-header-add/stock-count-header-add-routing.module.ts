import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountHeaderAddPage } from './stock-count-header-add.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountHeaderAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountHeaderAddPageRoutingModule {}
