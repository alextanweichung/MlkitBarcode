import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';

// Mock classes for testing
class NavControllerMock {
  navigateForward = jest.fn();
  navigateBack = jest.fn();
  setDirection = jest.fn();
}

class RouterMock {
  navigate = jest.fn();
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
  ],
  declarations: [],
  providers: [
    { provide: NavController, useClass: NavControllerMock },
    { provide: Router, useClass: RouterMock },
  ],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedTestingModule {}