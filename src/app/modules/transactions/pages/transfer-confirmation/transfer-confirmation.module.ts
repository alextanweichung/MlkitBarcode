import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferConfirmationPageRoutingModule } from './transfer-confirmation-routing.module';

import { TransferConfirmationPage } from './transfer-confirmation.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferConfirmationPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule
  ],
  declarations: [TransferConfirmationPage]
})
export class TransferConfirmationPageModule {}
