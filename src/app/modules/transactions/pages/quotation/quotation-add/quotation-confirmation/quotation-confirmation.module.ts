import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationConfirmationPageRoutingModule } from './quotation-confirmation-routing.module';

import { QuotationConfirmationPage } from './quotation-confirmation.page';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';
import { ItemCartPageModule } from 'src/app/shared/pages/item-cart/item-cart.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuotationConfirmationPageRoutingModule,
    SumModule,
    ItemCartPageModule
  ],
  declarations: [QuotationConfirmationPage]
})
export class QuotationConfirmationPageModule {}
