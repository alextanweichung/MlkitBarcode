import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesSummaryPageRoutingModule } from './consignment-sales-summary-routing.module';

import { ConsignmentSalesSummaryPage } from './consignment-sales-summary.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesSummaryPageRoutingModule,
    IdMappingModule
  ],
  declarations: [ConsignmentSalesSummaryPage]
})
export class ConsignmentSalesSummaryPageModule {}
