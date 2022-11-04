import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemPageRoutingModule } from './picking-item-routing.module';

import { PickingItemPage } from './picking-item.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemPageRoutingModule
  ],
  declarations: [PickingItemPage]
})
export class PickingItemPageModule {}
