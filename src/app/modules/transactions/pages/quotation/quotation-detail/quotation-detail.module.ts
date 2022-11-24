import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationDetailPageRoutingModule } from './quotation-detail-routing.module';

import { QuotationDetailPage } from './quotation-detail.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationDetailPageRoutingModule,
    SumModule,
    IdMappingModule
  ],
  declarations: [QuotationDetailPage]
})
export class QuotationDetailPageModule {}
