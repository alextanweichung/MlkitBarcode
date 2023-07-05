import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarcodeScanInputPageRoutingModule } from './barcode-scan-input-routing.module';

import { BarcodeScanInputPage } from './barcode-scan-input.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';
import { HideKeyboardDirective } from '../../utilities/hide-keyboard.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarcodeScanInputPageRoutingModule,
    IdMappingModule
  ],
  exports: [
    BarcodeScanInputPage
  ],
  declarations: [BarcodeScanInputPage, HideKeyboardDirective]
})
export class BarcodeScanInputPageModule {}
