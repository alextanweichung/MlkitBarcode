import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesPageRoutingModule } from './consignment-sales-routing.module';

import { ConsignmentSalesPage } from './consignment-sales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesPageRoutingModule
  ],
  declarations: [ConsignmentSalesPage]
})
export class ConsignmentSalesPageModule {}
