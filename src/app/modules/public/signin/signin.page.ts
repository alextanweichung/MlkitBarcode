import { Component, OnInit } from '@angular/core';
import { NavController, ViewDidEnter } from '@ionic/angular';
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
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit, ViewDidEnter {

  current_year: number = new Date().getFullYear();
  currentVersion: string;

  signin_form: UntypedFormGroup;
  submit_attempt: boolean = false;

  rememberMe: boolean = false;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private configService: ConfigService,
    private formBuilder: UntypedFormBuilder,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private navController: NavController
  ) { 
    this.currentVersion = environment.version;
  }

  ionViewDidEnter(): void {
    this.rememberMe = this.configService.sys_parameter.rememberMe;
    if (this.rememberMe) {
      this.signin_form.get('userEmail').setValue(this.configService.sys_parameter.username);
      this.signin_form.get('password').setValue(this.configService.sys_parameter.password);
    }
  }

  ngOnInit() {
    // Setup form
    this.signin_form = this.formBuilder.group({
      userEmail: ['', Validators.compose([Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
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

    // If email or password empty
    if (this.signin_form.value.email == '' || this.signin_form.value.password == '') {
      this.toastService.presentToast('Error', 'Please input email and password', 'top', 'danger', 2000);
    } else {
      let loginModel: LoginRequest = this.signin_form.value;
      (await this.authService.signIn(loginModel)).subscribe(async response => {
        await this.navController.navigateRoot('/dashboard');
        if (Capacitor.getPlatform() !== 'web') {
          if (this.rememberMe) {
            this.configService.sys_parameter.username = this.signin_form.controls.userEmail.value;
            this.configService.sys_parameter.password = this.signin_form.controls.password.value;
            await this.configService.update(this.configService.sys_parameter);
          } else {            
            this.configService.sys_parameter.username = '';
            this.configService.sys_parameter.password = '';
          }
          try {
            await this.loadingService.showLoading("Syncing Offline Table");
            let response = await this.commonService.syncInbound();
            let itemMaster: PDItemMaster[] = response['itemMaster'];
            let itemBarcode: PDItemBarcode[] = response['itemBarcode'];
            await this.configService.syncInboundData(itemMaster, itemBarcode);
            // await this.configService.loadItemMaster();
            // await this.configService.loadItemBarcode();
            await this.loadingService.dismissLoading();       
          } catch (error) {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast(error.message, '', 'top', 'medium', 1000);
          }
        }
      });
    }
  }

}
