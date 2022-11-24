import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {  } from './item-add-list-variation-modal-routing.module';

import { ItemAddListVariationModalPage } from './item-add-list-variation-modal.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IdMappingModule
  ],
  exports: [
    ItemAddListVariationModalPage
  ],
  declarations: [ItemAddListVariationModalPage]
})
export class ItemAddListWithVariationPageModule {}
