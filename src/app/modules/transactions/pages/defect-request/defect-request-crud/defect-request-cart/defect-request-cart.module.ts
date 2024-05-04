import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefectRequestCartPageRoutingModule } from './defect-request-cart-routing.module';

import { DefectRequestCartPage } from './defect-request-cart.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from 'src/app/shared/pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from 'src/app/shared/pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      DefectRequestCartPageRoutingModule,
      IdMappingModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule
   ],
   declarations: [DefectRequestCartPage]
})
export class DefectRequestCartPageModule { }
