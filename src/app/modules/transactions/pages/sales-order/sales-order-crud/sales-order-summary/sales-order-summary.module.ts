import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderSummaryPageRoutingModule } from './sales-order-summary-routing.module';

import { SalesOrderSummaryPage } from './sales-order-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderSummaryPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [SalesOrderSummaryPage]
})
export class SalesOrderSummaryPageModule {}
