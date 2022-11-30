import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockCountHeaderEditPage } from './stock-count-header-edit.page';

const routes: Routes = [
  {
    path: '',
    component: StockCountHeaderEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockCountHeaderEditPageRoutingModule {}
