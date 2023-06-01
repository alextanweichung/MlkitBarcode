import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingHeaderPageRoutingModule } from './picking-header-routing.module';

import { PickingHeaderPage } from './picking-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { CameraScanInputPageModule } from 'src/app/shared/pages/camera-scan-input/camera-scan-input.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PickingHeaderPageRoutingModule,
    SearchDropdownPageModule,
    CameraScanInputPageModule,
    IdMappingModule,
    NgCircleProgressModule
  ],
  declarations: [PickingHeaderPage]
})
export class PickingHeaderPageModule {}
