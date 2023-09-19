import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockReorderPageRoutingModule } from './stock-reorder-routing.module';

import { StockReorderPage } from './stock-reorder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockReorderPageRoutingModule
  ],
  declarations: [StockReorderPage]
})
export class StockReorderPageModule {}
