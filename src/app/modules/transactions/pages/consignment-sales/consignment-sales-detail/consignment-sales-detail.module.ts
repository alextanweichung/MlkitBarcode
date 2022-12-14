import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesDetailPageRoutingModule } from './consignment-sales-detail-routing.module';

import { ConsignmentSalesDetailPage } from './consignment-sales-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [ConsignmentSalesDetailPage]
})
export class ConsignmentSalesDetailPageModule {}
