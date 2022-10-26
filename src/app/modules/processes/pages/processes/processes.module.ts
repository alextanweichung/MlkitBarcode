import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProcessesPageRoutingModule } from './processes-routing.module';

import { ProcessesPage } from './processes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProcessesPageRoutingModule
  ],
  declarations: [ProcessesPage]
})
export class ProcessesPageModule {}
