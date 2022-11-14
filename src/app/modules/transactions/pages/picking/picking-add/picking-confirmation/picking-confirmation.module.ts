import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingConfirmationPageRoutingModule } from './picking-confirmation-routing.module';

import { PickingConfirmationPage } from './picking-confirmation.page';
import { ItemViewListFlatPageModule } from 'src/app/shared/pages/item-view-list-flat/item-view-list-flat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickingConfirmationPageRoutingModule,
    ItemViewListFlatPageModule
  ],
  declarations: [PickingConfirmationPage]
})
export class PickingConfirmationPageModule {}
