import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApprovalsPageRoutingModule } from './approvals-routing.module';

import { ApprovalsPage } from './approvals.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApprovalsPageRoutingModule
  ],
  declarations: [ApprovalsPage]
})
export class ApprovalsPageModule {}
