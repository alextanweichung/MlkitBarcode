import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCatalogPageRoutingModule } from './item-catalog-routing.module';

import { ItemCatalogPage } from './item-catalog.page';
import { GeneralSalesGridPageModule } from '../general-sales-grid/general-sales-grid.module';
import { GeneralSalesListPageModule } from '../general-sales-list/general-sales-list.module';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemCatalogPageRoutingModule,
    GeneralSalesGridPageModule,
    GeneralSalesListPageModule,
    IdMappingModule
  ],
  exports: [
    ItemCatalogPage
  ],
  declarations: [ItemCatalogPage]
})
export class ItemCatalogPageModule {}
