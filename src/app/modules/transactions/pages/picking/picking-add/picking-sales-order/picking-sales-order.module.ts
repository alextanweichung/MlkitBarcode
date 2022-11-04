import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickingSalesOrderPageRoutingModule } from './picking-sales-order-routing.module';

import { PickingSalesOrderPage } from './picking-sales-order.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PickingSalesOrderPageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [PickingSalesOrderPage]
})
export class PickingSalesOrderPageModule {}
