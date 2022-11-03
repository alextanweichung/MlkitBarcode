import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtpConfigurationPageRoutingModule } from './otp-configuration-routing.module';

import { OtpConfigurationPage } from './otp-configuration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtpConfigurationPageRoutingModule
  ],
  declarations: [OtpConfigurationPage]
})
export class OtpConfigurationPageModule {}
