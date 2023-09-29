import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalesAnalysisPageRoutingModule } from './sales-analysis-routing.module';

import { SalesAnalysisPage } from './sales-analysis.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SearchDropdownPageModule } from 'src/app/shared/pages/search-dropdown/search-dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesAnalysisPageRoutingModule,
    SearchDropdownPageModule,
    NgxDatatableModule
  ],
  declarations: [SalesAnalysisPage]
})
export class SalesAnalysisPageModule {}
