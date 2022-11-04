import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingConfirmationPageRoutingModule } from './picking-confirmation-routing.module';

import { PickingConfirmationPage } from './picking-confirmation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickingConfirmationPageRoutingModule
  ],
  declarations: [PickingConfirmationPage]
})
export class PickingConfirmationPageModule {}
