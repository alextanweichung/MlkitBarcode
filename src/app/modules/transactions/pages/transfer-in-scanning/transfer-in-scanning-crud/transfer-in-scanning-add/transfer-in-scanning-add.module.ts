import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferInScanningAddPageRoutingModule } from './transfer-in-scanning-add-routing.module';

import { TransferInScanningAddPage } from './transfer-in-scanning-add.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferInScanningAddPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule
  ],
  declarations: [TransferInScanningAddPage]
})
export class TransferInScanningAddPageModule {}
