import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemAddGridPageRoutingModule } from './item-add-grid-routing.module';

import { ItemAddGridPage } from './item-add-grid.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemAddGridPageRoutingModule
  ],
  exports: [
    ItemAddGridPage
  ],
  declarations: [ItemAddGridPage]
})
export class ItemAddGridPageModule {}
