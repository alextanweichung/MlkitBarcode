import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtherSalesItemPageRoutingModule } from './other-sales-item-routing.module';

import { OtherSalesItemPage } from './other-sales-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtherSalesItemPageRoutingModule,
    BarcodeScanInputPageModule,
    ItemAddListFlatPageModule,
    IdMappingModule
  ],
  declarations: [OtherSalesItemPage]
})
export class OtherSalesItemPageModule {}
