import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingSummaryPageRoutingModule } from './packing-summary-routing.module';

import { PackingSummaryPage } from './packing-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingSummaryPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PackingSummaryPage]
})
export class PackingSummaryPageModule {}
