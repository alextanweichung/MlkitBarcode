import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferOutPageRoutingModule } from './transfer-out-routing.module';

import { TransferOutPage } from './transfer-out.page';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      IonicModule,
      TransferOutPageRoutingModule,
      NgxPaginationModule
   ],
   declarations: [TransferOutPage]
})
export class TransferOutPageModule { }
