import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtherSalesDetailPageRoutingModule } from './other-sales-detail-routing.module';

import { OtherSalesDetailPage } from './other-sales-detail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtherSalesDetailPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [OtherSalesDetailPage]
})
export class OtherSalesDetailPageModule {}
