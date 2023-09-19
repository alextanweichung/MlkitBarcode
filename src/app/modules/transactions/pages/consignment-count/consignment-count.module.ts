import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountPageRoutingModule } from './consignment-count-routing.module';

import { ConsignmentCountPage } from './consignment-count.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentCountPageRoutingModule,
    IdMappingModule
  ],
  declarations: [ConsignmentCountPage]
})
export class ConsignmentCountPageModule {}
