import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingDetailPageRoutingModule } from './packing-detail-routing.module';

import { PackingDetailPage } from './packing-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PackingDetailPage]
})
export class PackingDetailPageModule {}
