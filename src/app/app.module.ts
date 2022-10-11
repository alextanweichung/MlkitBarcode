import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Storage  } from '@ionic/storage';

import { HttpClientModule } from '@angular/common/http';
import { InitializeAppService } from './services/sqlite/initialize.app.service';
import { SQLiteService } from './services/sqlite/sqlite.service';
import { DatabaseService } from './services/sqlite/database.service';
import { MigrationService } from './services/sqlite/migration.service';
import { DetailService } from './services/sqlite/detail.service';

export function initializeFactory(init: InitializeAppService) {
  return () => init.initializeApp();
}

// export function configFactory(configService: ConfigService) {
//   return () => configService.loadConfig();
// }

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({ mode: 'ios' }), 
    ReactiveFormsModule, 
    AppRoutingModule, 
    NgChartsModule,
    HttpClientModule
  ],
  providers: [
    SQLiteService,
    DetailService,
    DatabaseService,
    InitializeAppService,
    { provide: APP_INITIALIZER, useFactory: initializeFactory, deps: [InitializeAppService], multi: true },
    MigrationService,

  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, Storage],
  bootstrap: [AppComponent],
})
export class AppModule { }
