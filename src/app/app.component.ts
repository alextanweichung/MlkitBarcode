import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { ConfigService } from './services/config/config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  private initPlugin: boolean;

  constructor(
    private platform: Platform,
    private configService: ConfigService,
    private router: Router
  ) {
    this.initializeApp();
  }

  // Initialize app
  initializeApp() {

    // Wait until platform is ready
    this.platform.ready().then(async () => {

      // If we're on a mobile platform (iOS / Android), not web
      if (Capacitor.getPlatform() !== 'web') {

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
