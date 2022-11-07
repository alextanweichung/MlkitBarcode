import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingConfirmationPageRoutingModule } from './packing-confirmation-routing.module';

import { PackingConfirmationPage } from './packing-confirmation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingConfirmationPageRoutingModule
  ],
  declarations: [PackingConfirmationPage]
})
export class PackingConfirmationPageModule {}
