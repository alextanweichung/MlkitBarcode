import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { ConfigService } from './services/config/config.service';
import { Keyboard } from '@capacitor/keyboard';

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
    private navController: NavController
  ) {
    this.initializeApp();
  }

  // Initialize app
  initializeApp() {

    // Wait until platform is ready
    this.platform.ready().then(async () => {

      if (this.configService.sys_parameter) {
        // this.navController.navigateRoot('/signin');
      } else {
        this.navController.navigateRoot('/welcome');
      }

      // If we're on a mobile platform (iOS / Android), not web
      if (Capacitor.getPlatform() !== 'web') {
        this.platform.backButton.unsubscribe();
        // Set StatusBar style (dark / light)
        await StatusBar.setStyle({ style: Style.Dark });
      }

      // ...
      // do some more config and setup if necessary
      // ...

      // Fake timeout since we do not load any data
      setTimeout(async () => {

        // Hide SplashScreen
        await SplashScreen.hide();
      }, 2000);
    });
  }
}
