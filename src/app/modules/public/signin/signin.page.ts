import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast/toast.service';
import { environment } from 'src/environments/environment';
import { LoginRequest } from 'src/app/services/auth/login-user';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  current_year: number = new Date().getFullYear();
  currentVersion: string;

  signin_form: UntypedFormGroup;
  submit_attempt: boolean = false;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private configService: ConfigService,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private navController: NavController,
    private loadingController: LoadingController
  ) { 
    this.currentVersion = environment.version;
  }

  ngOnInit() {
    // Setup form
    this.signin_form = this.formBuilder.group({
      userEmail: ['', Validators.compose([Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });

    // DEBUG: Prefill inputs
    // this.signin_form.get('userEmail').setValue('aychia@idcp.my');
    // this.signin_form.get('password').setValue('String1234');
  }

  // Sign in
  async signIn() {
    this.submit_attempt = true;
    if (Capacitor.getPlatform() !== 'web') {
      OneSignal.getDeviceState(function (stateChanges) {
        localStorage.setItem('player_Id', stateChanges.userId);
      });
    } else {
      localStorage.setItem('player_Id', '6ce7134e-5a4b-426f-b89b-54de14e05eba');
    }
    // Loading overlay
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Syncing Offline Table...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    // If email or password empty
    if (this.signin_form.value.email == '' || this.signin_form.value.password == '') {
      this.toastService.presentToast('Error', 'Please input email and password', 'top', 'danger', 2000);
    } else {
      let loginModel: LoginRequest = this.signin_form.value;
      (await this.authService.signIn(loginModel)).subscribe(async response => {
        await this.navController.navigateRoot('/dashboard');
        if (Capacitor.getPlatform() !== 'web') {
          try {
            await loading.present();
            let response = await this.commonService.syncInbound();
            let itemMaster: PDItemMaster[] = response['itemMaster'];
            let itemBarcode: PDItemBarcode[] = response['itemBarcode'];
            await this.configService.syncInboundData(itemMaster, itemBarcode);
            // await this.configService.loadItemMaster();
            // await this.configService.loadItemBarcode();

            // Fake timeout
            setTimeout(() => {
              loading.dismiss();
            }, 2000);
            
          } catch (error) {
            loading.dismiss();
            this.toastService.presentToast(error.message, '', 'top', 'medium', 1000);
          }
        }
      });
    }
  }

}
