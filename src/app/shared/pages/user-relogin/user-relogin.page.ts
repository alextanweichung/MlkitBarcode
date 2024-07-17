import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CodeInputComponent } from 'angular-code-input';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginRequest, LoginUser } from 'src/app/services/auth/login-user';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
   selector: 'app-user-relogin',
   templateUrl: './user-relogin.page.html',
   styleUrls: ['./user-relogin.page.scss'],
})
export class UserReloginPage implements OnInit {
   title: string = "Login";
   tokenExpiredBehavior: string;
   displayMode: number = 0; //0: Login, 1: Login Complete
   loginError: string = "";
   inputRequired: string = "";
   loginModel: LoginRequest = { userEmail: "", password: "", loginUserType: "B" };
   show2FaDialog: boolean = false;
   loginResponse: LoginUser;
   loginUser: LoginUser;
   currentLoginUser: LoginUser;
   @ViewChild("inputPassword") inputPasswordElement: ElementRef;
   @ViewChild("codeInput2Fa") codeInput !: CodeInputComponent;

   constructor(
      private accountService: AuthService,
      private toastService: ToastService,
      private modalController: ModalController
   ) { }

   ngOnInit() {
      this.currentLoginUser = this.loginUser
      console.log("🚀 ~ UserReloginPage ~ ngOnInit ~ this.currentLoginUser:", this.currentLoginUser)
      const token = {
         accessToken: this.currentLoginUser?.token,
         refreshToken: this.currentLoginUser?.refreshToken
      }
      this.loginModel.userEmail = this.currentLoginUser.userEmail;
      this.tokenExpiredBehavior = this.currentLoginUser.tokenExpiredBehavior;
      console.log("🚀 ~ UserReloginPage ~ ngOnInit ~ this.tokenExpiredBehavior:", this.tokenExpiredBehavior)
      if (this.tokenExpiredBehavior === "2") {
         this.accountService.refreshToken(token).subscribe(response => {
            this.accountService.buildAllObjects();
            this.displayMode = 1;
            console.log("🚀 ~ UserReloginPage ~ this.accountService.refreshToken ~ this.displayMode:", this.displayMode)
         }, error => {
            console.log(error);
            this.displayMode = 0;
            console.log("🚀 ~ UserReloginPage ~ this.accountService.refreshToken ~ this.displayMode:", this.displayMode)
            setTimeout(() => {
               this.inputPasswordElement.nativeElement.focus();
            }, 100);
         });
      } else {
         this.displayMode = 0;
         console.log("🚀 ~ UserReloginPage ~ ngOnInit ~ this.displayMode:", this.displayMode)
         setTimeout(() => {
            this.inputPasswordElement.nativeElement.focus();
         }, 100);
      }
   }

   async login(append2Fa?: boolean, twoFactorAuthCode?: string) {
      this.inputRequired = "";
      if (this.loginModel.userEmail == "" || this.loginModel.password == "") {
         this.inputRequired = "Please login with your email & password"
      } else {
         if (append2Fa) {
            this.loginModel.twoFactorType = "authenticator";
            this.loginModel.twoFactorAuthCode = twoFactorAuthCode;
         }
         localStorage.removeItem("loginUser");
         (await this.accountService.signIn(this.loginModel)).subscribe(response => {
            const loginUser: LoginUser = JSON.parse(localStorage.getItem("loginUser"));
            if (loginUser) {
               if (loginUser.loginUserGroupType == "API") {
                  this.toastService.presentToast("System Notification", "Login is not allowed.", "top", "danger", 2000);
               } else {
                  this.toastService.presentToast("Logged in successfully", "", "top", "danger", 2000);
                  this.modalController.dismiss();
               }
            } else {
               this.loginResponse = response;
               if (this.loginResponse.status == "2FA") {
                  this.show2FaDialog = true;
               } else if (this.loginResponse.status == "IAC") {
                  this.toastService.presentToast("System Notification", "Invalid Authentication Code.", "top", "danger", 2000);
                  this.codeInput.focusOnField(5);
                  this.loginModel.twoFactorType = null;
                  this.loginModel.twoFactorAuthCode = null;
               }
               else {
                  this.loginModel.twoFactorType = null;
                  this.loginModel.twoFactorAuthCode = null;
               }
            }
            //upon successful login, route to main page   
         }, error => {
            console.log(error);
            this.loginError = error.error;
            this.loginModel.twoFactorType = null;
            this.loginModel.twoFactorAuthCode = null;
         })
      }
   }

   handleKeyUpLogin(e) {
      if (e.keyCode === 13) {
         e.preventDefault();
         this.login();
      }
   }

   on2FaDialogHide() {
      this.loginResponse = null;
   }

   isDisplayQrImage() {
      if (this.loginResponse) {
         let findAuthenticator = this.loginResponse.options.find(x => x.type == "authenticator");
         if (findAuthenticator) {
            if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.qrCodeSetupImageUrl) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   get2FAQrImage() {
      let findAuthenticator = this.loginResponse.options.find(x => x.type == "authenticator");
      if (findAuthenticator) {
         if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.qrCodeSetupImageUrl) {
            return findAuthenticator.setupInfo.qrCodeSetupImageUrl;
         } else {
            return null;
         }
      }
   }

   get2FAManualKey() {
      let findAuthenticator = this.loginResponse.options.find(x => x.type == "authenticator");
      if (findAuthenticator) {
         if (findAuthenticator.setupInfo && findAuthenticator.setupInfo.manualEntryKey) {
            return findAuthenticator.setupInfo.manualEntryKey;
         } else {
            return null;
         }
      }
   }

   copyToClipboard(manualKey: string) {
      navigator.clipboard.writeText(manualKey)
         .then(() => {
            this.toastService.presentToast("", "Copied to clipboard.", "top", "success", 1000);
         }).catch(e => console.log(e));
   }

   onCodeCompleted(event: any) {
      this.login(true, event);
   }

   closeRef() {
      console.log("🚀 ~ UserReloginPage ~ closeRef ~ this.modalController:", this.modalController)
      this.modalController.dismiss();
   }

}
