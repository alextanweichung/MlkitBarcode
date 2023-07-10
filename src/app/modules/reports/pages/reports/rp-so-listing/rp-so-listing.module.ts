import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSoListingPageRoutingModule } from './rp-so-listing-routing.module';

import { RpSoListingPage } from './rp-so-listing.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchMultiDropdownPageModule } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.module';
import { CalendarInputPageModule } from 'src/app/shared/pages/calendar-input/calendar-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSoListingPageRoutingModule,
    NgxDatatableModule,
    SearchMultiDropdownPageModule,
    CalendarInputPageModule
  ],
  declarations: [RpSoListingPage]
})
export class RpSoListingPageModule {}
