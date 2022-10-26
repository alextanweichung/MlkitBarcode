import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemAddListPageRoutingModule } from './item-add-list-routing.module';

import { ItemAddListPage } from './item-add-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemAddListPageRoutingModule
  ],
  exports: [
    ItemAddListPage
  ],
  declarations: [ItemAddListPage]
})
export class ItemAddListPageModule {}
