import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSoListingPageRoutingModule } from './rp-so-listing-routing.module';

import { RpSoListingPage } from './rp-so-listing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSoListingPageRoutingModule
  ],
  declarations: [RpSoListingPage]
})
export class RpSoListingPageModule {}
