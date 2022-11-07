import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingSalesOrderPageRoutingModule } from './packing-sales-order-routing.module';

import { PackingSalesOrderPage } from './packing-sales-order.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PackingSalesOrderPageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [PackingSalesOrderPage]
})
export class PackingSalesOrderPageModule {}
