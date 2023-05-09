import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSoListingPageRoutingModule } from './rp-so-listing-routing.module';

import { RpSoListingPage } from './rp-so-listing.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSoListingPageRoutingModule,
    NgxDatatableModule
  ],
  declarations: [RpSoListingPage]
})
export class RpSoListingPageModule {}
