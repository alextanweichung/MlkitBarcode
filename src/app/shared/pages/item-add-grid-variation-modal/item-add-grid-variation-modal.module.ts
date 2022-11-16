import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemAddGridVariationMPageRoutingModule } from './item-add-grid-variation-modal-routing.module';

import { ItemAddGridVariationMPage } from './item-add-grid-variation-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemAddGridVariationMPageRoutingModule
  ],
  exports: [
    ItemAddGridVariationMPage
  ],
  declarations: [ItemAddGridVariationMPage]
})
export class ItemAddGridVariationMPageModule {}
