import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingItemPageRoutingModule } from './packing-item-routing.module';

import { PackingItemPage } from './packing-item.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingItemPageRoutingModule
  ],
  declarations: [PackingItemPage]
})
export class PackingItemPageModule {}
