import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemPageRoutingModule } from './picking-item-routing.module';

import { PickingItemPage } from './picking-item.page';
import { BarcodeScanInputPageModule } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.module';
import { ItemAddListFlatPageModule } from 'src/app/shared/pages/item-add-list-flat/item-add-list-flat.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemPageRoutingModule,
    BarcodeScanInputPageModule,
    ItemAddListFlatPageModule,
    CameraScanInputPageModule,
    NgCircleProgressModule
  ],
  declarations: [PickingItemPage]
})
export class PickingItemPageModule {}
