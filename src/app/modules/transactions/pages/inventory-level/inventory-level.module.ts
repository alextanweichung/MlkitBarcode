import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryLevelPageRoutingModule } from './inventory-level-routing.module';

import { InventoryLevelPage } from './inventory-level.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryLevelPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule
  ],
  declarations: [InventoryLevelPage]
})
export class InventoryLevelPageModule {}
