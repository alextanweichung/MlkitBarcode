import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderDetailPageRoutingModule } from './sales-order-detail-routing.module';

import { SalesOrderDetailPage } from './sales-order-detail.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderDetailPageRoutingModule,
    SumModule,
    IdMappingModule
  ],
  declarations: [SalesOrderDetailPage]
})
export class SalesOrderDetailPageModule {}