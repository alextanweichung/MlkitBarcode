import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeneralSalesGridPage } from './general-sales-grid.page';

const routes: Routes = [
  {
    path: '',
    component: GeneralSalesGridPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralSalesGridPageRoutingModule {}
