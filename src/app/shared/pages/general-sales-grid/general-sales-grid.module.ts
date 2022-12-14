import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GeneralSalesGridPageRoutingModule } from './general-sales-grid-routing.module';

import { GeneralSalesGridPage } from './general-sales-grid.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneralSalesGridPageRoutingModule,
    IdMappingModule
  ],
  exports: [
    GeneralSalesGridPage
  ],
  declarations: [GeneralSalesGridPage]
})
export class GeneralSalesGridPageModule {}
