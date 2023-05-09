import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BacktobackOrderCartPageRoutingModule } from './backtoback-order-cart-routing.module';

import { BacktobackOrderCartPage } from './backtoback-order-cart.page';
import { IdMappingModule } from 'src/app/shared/pipes/id-mapping/id-mapping.module';
import { SumModule } from 'src/app/shared/pipes/sum/sum.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BacktobackOrderCartPageRoutingModule,
    IdMappingModule,
    SumModule
  ],
  declarations: [BacktobackOrderCartPage]
})
export class BacktobackOrderCartPageModule {}
