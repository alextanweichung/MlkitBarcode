import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashDepositEditPageRoutingModule } from './cash-deposit-edit-routing.module';

import { CashDepositEditPage } from './cash-deposit-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashDepositEditPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CashDepositEditPage]
})
export class CashDepositEditPageModule {}
