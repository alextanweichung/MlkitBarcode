import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Storage } from '@ionic/storage';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InitializeAppService } from './services/sqlite/initialize.app.service';
import { SQLiteService } from './services/sqlite/sqlite.service';
import { DatabaseService } from './services/sqlite/database.service';
import { MigrationService } from './services/sqlite/migration.service';
import { DetailService } from './services/sqlite/detail.service';
import { ErrorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UtcCalendarDirective } from './shared/utilities/utc-calendar.directive';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

export function initializeFactory(init: InitializeAppService) {
    return () => init.initializeApp();
}

@NgModule({
    declarations: [
        AppComponent,
        UtcCalendarDirective
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot({ mode: 'ios' }),
        ReactiveFormsModule,
        AppRoutingModule,
        NgChartsModule,
        HttpClientModule,
        NgxSpinnerModule,
        BrowserAnimationsModule
    ],
    providers: [
        File,
        FileOpener,
        AndroidPermissions,
        SQLiteService,
        DetailService,
        DatabaseService,
        InitializeAppService,
        { provide: APP_INITIALIZER, useFactory: initializeFactory, deps: [InitializeAppService], multi: true },
        MigrationService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        Storage
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
