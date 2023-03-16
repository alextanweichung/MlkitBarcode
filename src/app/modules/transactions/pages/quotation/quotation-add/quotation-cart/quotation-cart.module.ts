import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationCartPageRoutingModule } from './quotation-cart-routing.module';

import { QuotationCartPage } from './quotation-cart.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationCartPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [QuotationCartPage]
})
export class QuotationCartPageModule {}
