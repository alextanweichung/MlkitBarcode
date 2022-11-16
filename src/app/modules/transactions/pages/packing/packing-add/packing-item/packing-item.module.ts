import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingItemPageRoutingModule } from './packing-item-routing.module';

import { PackingItemPage } from './packing-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingItemPageRoutingModule,
    BarcodeScanInputPageModule,
    ItemAddListFlatPageModule
  ],
  declarations: [PackingItemPage]
})
export class PackingItemPageModule {}
