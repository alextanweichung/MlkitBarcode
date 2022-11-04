import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingSummaryPageRoutingModule } from './picking-summary-routing.module';

import { PickingSummaryPage } from './picking-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickingSummaryPageRoutingModule,
    IdMappingModule
  ],
  declarations: [PickingSummaryPage]
})
export class PickingSummaryPageModule {}
