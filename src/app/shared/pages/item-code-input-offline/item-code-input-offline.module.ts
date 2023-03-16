import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCodeInputOfflinePageRoutingModule } from './item-code-input-offline-routing.module';

import { ItemCodeInputOfflinePage } from './item-code-input-offline.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemCodeInputOfflinePageRoutingModule,
    IdMappingModule
  ],
  exports: [
    ItemCodeInputOfflinePage
  ],
  declarations: [ItemCodeInputOfflinePage]
})
export class ItemCodeInputOfflinePageModule {}
