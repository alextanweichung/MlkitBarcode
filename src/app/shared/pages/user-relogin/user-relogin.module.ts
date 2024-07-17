import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserReloginPageRoutingModule } from './user-relogin-routing.module';

import { UserReloginPage } from './user-relogin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserReloginPageRoutingModule
  ],
  declarations: [UserReloginPage]
})
export class UserReloginPageModule {}
