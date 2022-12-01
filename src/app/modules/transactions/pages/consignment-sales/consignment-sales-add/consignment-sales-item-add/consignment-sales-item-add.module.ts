import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesItemAddPageRoutingModule } from './consignment-sales-item-add-routing.module';

import { ConsignmentSalesItemAddPage } from './consignment-sales-item-add.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesItemAddPageRoutingModule,
    BarcodeScanInputPageModule,
    ItemAddListFlatPageModule,
    IdMappingModule
  ],
  declarations: [ConsignmentSalesItemAddPage]
})
export class ConsignmentSalesItemAddPageModule {}
