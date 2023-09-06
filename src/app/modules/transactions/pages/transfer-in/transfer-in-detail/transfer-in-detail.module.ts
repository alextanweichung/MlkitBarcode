import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInDetailPageRoutingModule } from './transfer-in-detail-routing.module';

import { TransferInDetailPage } from './transfer-in-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [TransferInDetailPage]
})
export class TransferInDetailPageModule {}
