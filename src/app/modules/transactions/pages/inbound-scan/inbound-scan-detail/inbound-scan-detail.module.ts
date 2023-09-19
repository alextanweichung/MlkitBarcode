import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboundScanDetailPageRoutingModule } from './inbound-scan-detail-routing.module';

import { InboundScanDetailPage } from './inbound-scan-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InboundScanDetailPageRoutingModule,
    IdMappingModule
  ],
  declarations: [InboundScanDetailPage]
})
export class InboundScanDetailPageModule {}
