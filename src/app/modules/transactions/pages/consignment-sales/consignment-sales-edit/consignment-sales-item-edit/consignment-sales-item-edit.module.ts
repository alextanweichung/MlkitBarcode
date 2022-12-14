import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesItemEditPageRoutingModule } from './consignment-sales-item-edit-routing.module';

import { ConsignmentSalesItemEditPage } from './consignment-sales-item-edit.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesItemEditPageRoutingModule,
    BarcodeScanInputPageModule,
    IdMappingModule
  ],
  declarations: [ConsignmentSalesItemEditPage]
})
export class ConsignmentSalesItemEditPageModule {}
