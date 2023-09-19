import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesItemEditPageRoutingModule } from './consignment-sales-item-edit-routing.module';

import { ConsignmentSalesItemEditPage } from './consignment-sales-item-edit.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { ItemCodeInputOfflinePageModule } from 'src/app/shared/pages/item-code-input-offline/item-code-input-offline.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesItemEditPageRoutingModule,
    BarcodeScanInputPageModule,
    IdMappingModule,
    CameraScanInputPageModule,
    ItemCodeInputOfflinePageModule
  ],
  declarations: [ConsignmentSalesItemEditPage]
})
export class ConsignmentSalesItemEditPageModule {}
