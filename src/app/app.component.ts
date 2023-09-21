import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConfigService } from './services/config/config.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { NotificationsService } from './shared/services/notifications.service';
import OneSignal from 'onesignal-cordova-plugin';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  private initPlugin: boolean;

  constructor(
    private platform: Platform,
    private router: Router,
    private configService: ConfigService,
    private navController: NavController,
    private pushNotications: NotificationsService
  ) {
    this.initializeApp();
  }

  // Initialize app
  initializeApp() {
    // Wait until platform is ready
    this.platform.ready().then(async () => {
      await this.configService.load();

      if (this.configService.sys_parameter && this.configService.sys_parameter.length > 0) {
        this.navController.navigateRoot("/signin");
      } else {
        this.navController.navigateRoot("/welcome");
      }

      // If we"re on a mobile platform (iOS / Android), not web
      if (Capacitor.getPlatform() !== "web") {
        // this.pushNotications.initPush();
        await OneSignalInit();

        this.platform.backButton.unsubscribe();
        // Set StatusBar style (dark / light)
        await StatusBar.setStyle({ style: Style.Dark });
        await BarcodeScanner.checkPermission({ force: true });
      }

      // ...
      // do some more config and setup if necessary
      // ...

      // Fake timeout since we do not load any data
      setTimeout(async () => {
        // Hide SplashScreen
        // await SplashScreen.hide();
        SplashScreen.hide({
          fadeOutDuration: 1000
        })
      }, 2000);
    });
  }
}

function OneSignalInit() {
  // Uncomment to set OneSignal device logging to VERBOSE  
  // OneSignal.setLogLevel(6, 0);

  // NOTE: Update the setAppId value below with your OneSignal AppId.
  OneSignal.setAppId("18607f67-a6dc-44cb-ac02-91770a58a695");
  OneSignal.setNotificationOpenedHandler(function (jsonData) {
    console.log("notificationOpenedCallback: " + JSON.stringify(jsonData));
  });

  // Prompts the user for notification permissions.
  //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
  OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
    console.log("User accepted notifications: " + accepted);
  });
}

