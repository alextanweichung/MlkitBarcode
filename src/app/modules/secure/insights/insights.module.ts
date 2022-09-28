import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsightsPageRoutingModule } from './insights-routing.module';

import { InsightsPage } from './insights.page';

// NgCharts
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsightsPageRoutingModule,
    NgChartsModule
  ],
  declarations: [InsightsPage]
})
export class InsightsPageModule {}
