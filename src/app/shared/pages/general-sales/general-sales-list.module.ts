import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {  } from './general-sales-list.routing.module';

import { GeneralSalesListPage } from './general-sales-list.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IdMappingModule
  ],
  exports: [
    GeneralSalesListPage
  ],
  declarations: [GeneralSalesListPage]
})
export class ItemAddListWithVariationPageModule {}
