import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RpSaPerformanceListingPageRoutingModule } from './rp-sa-performance-listing-routing.module';

import { RpSaPerformanceListingPage } from './rp-sa-performance-listing.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RpSaPerformanceListingPageRoutingModule,
    NgxDatatableModule
  ],
  declarations: [RpSaPerformanceListingPage]
})
export class RpSaPerformanceListingPageModule {}
