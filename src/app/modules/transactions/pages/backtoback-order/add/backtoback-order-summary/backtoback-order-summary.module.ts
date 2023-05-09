import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BacktobackOrderSummaryPageRoutingModule } from './backtoback-order-summary-routing.module';

import { BacktobackOrderSummaryPage } from './backtoback-order-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BacktobackOrderSummaryPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [BacktobackOrderSummaryPage]
})
export class BacktobackOrderSummaryPageModule {}
