import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PackingPageRoutingModule } from './packing-routing.module';

import { PackingPage } from './packing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackingPageRoutingModule
  ],
  declarations: [PackingPage]
})
export class PackingPageModule {}
