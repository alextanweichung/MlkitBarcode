import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckBalancePageRoutingModule } from './check-balance-routing.module';

import { CheckBalancePage } from './check-balance.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckBalancePageRoutingModule,
    SearchDropdownPageModule
  ],
  declarations: [CheckBalancePage]
})
export class CheckBalancePageModule {}
