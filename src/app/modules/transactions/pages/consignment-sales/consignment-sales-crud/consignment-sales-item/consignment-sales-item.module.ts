import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesItemPageRoutingModule } from './consignment-sales-item-routing.module';

import { ConsignmentSalesItemPage } from './consignment-sales-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { ItemCodeInputOfflinePageModule } from 'src/app/shared/pages/item-code-input-offline/item-code-input-offline.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentSalesItemPageRoutingModule,
    BarcodeScanInputPageModule,
    ItemAddListFlatPageModule,
    IdMappingModule,
    ItemCodeInputOfflinePageModule,
    SumModule
  ],
  declarations: [ConsignmentSalesItemPage]
})
export class ConsignmentSalesItemPageModule {}
