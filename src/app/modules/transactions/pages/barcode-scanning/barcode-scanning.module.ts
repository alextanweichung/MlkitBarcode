import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { BarcodeScanningRoutingModule } from './barcode-scanning-routing.module';

import { SharedTestingModule } from '@tests/modules/shared-testing.module';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { BarcodeScanningPage } from './barcode-scanning.page';

@NgModule({
  imports: [SharedTestingModule, BarcodeScanningRoutingModule],
  declarations: [BarcodeScanningPage, BarcodeScanningModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BarcodeScanningModule {}