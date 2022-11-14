import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingConfirmationPageRoutingModule } from './packing-confirmation-routing.module';

import { PackingConfirmationPage } from './packing-confirmation.page';
import { ItemViewListFlatPageModule } from 'src/app/shared/pages/item-view-list-flat/item-view-list-flat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingConfirmationPageRoutingModule,
    ItemViewListFlatPageModule
  ],
  declarations: [PackingConfirmationPage]
})
export class PackingConfirmationPageModule {}
