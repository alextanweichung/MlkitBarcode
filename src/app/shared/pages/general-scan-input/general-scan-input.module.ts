import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GeneralScanInputPageRoutingModule } from './general-scan-input-routing.module';

import { GeneralScanInputPage } from './general-scan-input.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneralScanInputPageRoutingModule
  ],
  exports: [GeneralScanInputPage],
  declarations: [GeneralScanInputPage]
})
export class GeneralScanInputPageModule {}
