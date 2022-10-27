import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesOrderPageRoutingModule } from './sales-order-routing.module';

import { SalesOrderPage } from './sales-order.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesOrderPageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [SalesOrderPage]
})
export class SalesOrderPageModule {}
