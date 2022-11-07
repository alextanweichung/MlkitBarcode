import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingPage } from './packing.page';

const routes: Routes = [
  {
    path: '',
    component: PackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingPageRoutingModule {}
