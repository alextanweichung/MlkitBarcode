import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsignmentCountHeaderPageRoutingModule } from './consignment-count-header-routing.module';

import { ConsignmentCountHeaderPage } from './consignment-count-header.page';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsignmentCountHeaderPageRoutingModule,
    SearchDropdownPageModule
    ],
  declarations: [ConsignmentCountHeaderPage]
})
export class ConsignmentCountHeaderPageModule {}
