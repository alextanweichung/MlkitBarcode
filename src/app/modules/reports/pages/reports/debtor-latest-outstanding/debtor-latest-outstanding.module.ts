import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebtorLatestOutstandingPageRoutingModule } from './debtor-latest-outstanding-routing.module';

import { DebtorLatestOutstandingPage } from './debtor-latest-outstanding.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebtorLatestOutstandingPageRoutingModule,
    SearchDropdownPageModule,
    CalendarInputPageModule
  ],
  declarations: [DebtorLatestOutstandingPage]
})
export class DebtorLatestOutstandingPageModule {}
