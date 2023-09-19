import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingDetailPageRoutingModule } from './picking-detail-routing.module';

import { PickingDetailPage } from './picking-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickingDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PickingDetailPage]
})
export class PickingDetailPageModule {}
