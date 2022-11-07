import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingConfirmationPage } from './packing-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: PackingConfirmationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackingConfirmationPageRoutingModule {}
