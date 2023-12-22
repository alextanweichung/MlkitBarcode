import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingDetailPageRoutingModule } from './packing-detail-routing.module';

import { PackingDetailPage } from './packing-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingDetailPageRoutingModule,
    IdMappingModule,
    OfflineItemIdMappingModule
  ],
  declarations: [PackingDetailPage]
})
export class PackingDetailPageModule {}
