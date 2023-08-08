import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebtorApplicationEditPageRoutingModule } from './debtor-application-edit-routing.module';

import { DebtorApplicationEditPage } from './debtor-application-edit.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebtorApplicationEditPageRoutingModule,
    ReactiveFormsModule,
    SearchDropdownPageModule
  ],
  declarations: [DebtorApplicationEditPage]
})
export class DebtorApplicationEditPageModule {}
