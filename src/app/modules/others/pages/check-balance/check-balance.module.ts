import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckBalancePageRoutingModule } from './check-balance-routing.module';

import { CheckBalancePage } from './check-balance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckBalancePageRoutingModule
  ],
  declarations: [CheckBalancePage]
})
export class CheckBalancePageModule {}
