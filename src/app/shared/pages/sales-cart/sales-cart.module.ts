import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesCartPageRoutingModule } from './sales-cart-routing.module';

import { SalesCartPage } from './sales-cart.page';
import { IdMappingModule } from '../../pipes/id-mapping/id-mapping.module';
import { OfflineItemIdMappingModule } from '../../pipes/offline-item-id-mapping/offline-item-id-mapping.module';
import { OfflineItemIdDescMappingModule } from '../../pipes/offline-item-id-desc-mapping/offline-item-id-desc-mapping.module';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      SalesCartPageRoutingModule,
      IdMappingModule,
      OfflineItemIdMappingModule,
      OfflineItemIdDescMappingModule
   ],
   exports: [SalesCartPage],
   declarations: [SalesCartPage]
})
export class SalesCartPageModule { }
