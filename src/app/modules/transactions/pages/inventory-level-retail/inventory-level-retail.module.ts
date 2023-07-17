import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryLevelRetailPageRoutingModule } from './inventory-level-retail-routing.module';

import { InventoryLevelRetailPage } from './inventory-level-retail.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryLevelRetailPageRoutingModule,
    SearchDropdownPageModule,
    IdMappingModule
  ],
  declarations: [InventoryLevelRetailPage]
})
export class InventoryLevelRetailPageModule {}
