import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarcodeScanInputPageRoutingModule } from './barcode-scan-input-routing.module';

import { BarcodeScanInputPage } from './barcode-scan-input.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';
import HideKeyboardModule from '../../utilities/hide-keyboard.module';
import { CameraScanInputPageModule } from '../camera-scan-input/camera-scan-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarcodeScanInputPageRoutingModule,
    IdMappingModule,
    HideKeyboardModule
  ],
  exports: [
    BarcodeScanInputPage
  ],
  declarations: [BarcodeScanInputPage]
})
export class BarcodeScanInputPageModule {}
