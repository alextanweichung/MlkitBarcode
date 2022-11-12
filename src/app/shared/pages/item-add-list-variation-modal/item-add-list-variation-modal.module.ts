import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {  } from './item-add-list-variation-modal-routing.module';

import { ItemAddListVariationModalPage } from './item-add-list-variation-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    
  ],
  exports: [
    ItemAddListVariationModalPage
  ],
  declarations: [ItemAddListVariationModalPage]
})
export class ItemAddListWithVariationPageModule {}
