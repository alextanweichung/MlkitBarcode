import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralSalesListPage } from './general-sales-list.page';


const routes: Routes = [
  {
    path: '',
    component: GeneralSalesListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralSalesListPageRoutingModule {}
