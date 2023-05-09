import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ForgotPasswordRequest } from 'src/app/services/auth/login-user';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {

  companyName: string;
  current_year: number = new Date().getFullYear();
  currentVersion: string;

  object_form: UntypedFormGroup;
  submit_attempt: boolean = false;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private configService: ConfigService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder
  ) {
    this.currentVersion = environment.version;
    this.newObjectForm();
  }

  newObjectForm() {    
    this.baseUrl = this.configService.sys_parameter.apiUrl;
    this.object_form = this.formBuilder.group({
      userEmail: ['', Validators.compose([Validators.email, Validators.required])]
    });
  }

  ngOnInit() {
    if (Capacitor.getPlatform() === 'web') {
      this.object_form.get('userEmail').setValue('aychia@idcp.my');
    }
    this.loadCompanyName();
  }

  loadCompanyName() {
    this.authService.getCompanyName().subscribe(response => {
      this.companyName = response.name;
    }, error => {
      console.error(error);
    })
  }

  backToLogin(event) {
    this.navController.navigateRoot('/signin');
  }

  baseUrl: string;
  passwordResetRequest: ForgotPasswordRequest;
  async emailResetLink() {    
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Are you sure to reset?',
      buttons: [{
        text: 'Proceed',
        cssClass: 'success',
        handler: () => {
          this.passwordResetRequest = {
            userEmail: this.object_form.get('userEmail').value,
            clientURI: this.baseUrl.replace('api/','') + "reset-password"
          };
          this.authService.forgotPassword(this.passwordResetRequest).subscribe(response => {
            if (response.status == 200) {
              this.toastService.presentToast('', 'Password reset link has been sent to your registered email.', 'top', 'success', 1500);
              this.object_form.reset();
              this.navController.navigateRoot('/signin');
            }
          }, error => {
            console.error(error);
            this.toastService.presentToast('', error , 'top', 'danger', 1500);
          })
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'cancel'
      }]
    });
    await alert.present();
  }

}
