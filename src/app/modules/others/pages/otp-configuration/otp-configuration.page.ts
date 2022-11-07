import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { User } from 'src/app/shared/models/user';
import { OtpDTO, Otp, OtpLine } from '../../models/otp';
import { OtpService } from '../../services/otp.service';
import { App } from 'src/app/shared/models/app';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { format, parseISO } from 'date-fns';
import { CommonService } from 'src/app/shared/services/common.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-otp-configuration',
  templateUrl: './otp-configuration.page.html',
  styleUrls: ['./otp-configuration.page.scss'],
})
export class OtpConfigurationPage implements OnInit {

  lovStatics: MasterListDetails[] = [];
  apps: App[] = [];
  allApps: App[] = [];

  otps: Otp[] = [];
  otpsToShow: Otp[] = [];
  generatedOtpCode: string;

  selectedUser: any;
  selectedValidity: any;
  selectedApp: any;

  userSearchDropDownList: SearchDropdownList[] = [];
  validitySerachDropdownList: SearchDropdownList[] = [];
  appsSearchDropdownList: SearchDropdownList[] = [];

  date: Date = new Date();

  constructor(
    private toastService: ToastService,
    private otpConfigService: OtpService,
    private commonService: CommonService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.expiryDate = format(parseISO(this.date.toISOString()), 'MMM d, yyyy');
    this.loadUsers();
    this.loadOtps();
    this.loadCommonData();

  }

  users: User[] = [];
  loadUsers() {
    this.otpConfigService.getDescendantUser().subscribe(response => {
      this.users = response;
      console.log("🚀 ~ file: otp-configuration.page.ts ~ line 40 ~ OtpConfigurationPage ~ this.otpConfigService.getDescendantUser ~ this.users", this.users)
    }, error => {
      console.log(error);
    })
  }

  loadCommonData() {
    this.otpConfigService.getDescendantUser().subscribe((response: User[]) => {
      this.users = response;
      this.users.forEach(r => {
        this.userSearchDropDownList.push({
          id: r.userId,
          code: null,
          description: r.userName
        })
      })
    }, error => {
      console.log(error);
    })

    this.otpConfigService.getStaticLov().subscribe(response => {
      this.lovStatics = response.filter(x => x.objectName == 'OtpValidity' && x.details != null).flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.lovStatics.forEach(r => {
        this.validitySerachDropdownList.push({
          id: r.id,
          code: null,
          description: r.description
        })
      })
    }, error => {
      console.log(error);
    })

    this.otpConfigService.getAllApps().subscribe(response => {
      this.allApps = response;
      this.allApps.forEach(r => {
        this.appsSearchDropdownList.push({
          id: r.appId,
          code: r.appCode,
          description: r.description
        })
      })
    }, error => {
      console.log(error);
    })
  }

  loadOtps() {
    this.otpConfigService.getOtps().subscribe(response => {
      this.otps = response;
    }, error => {
      console.log(error);
    })
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Generated OTP',
      subHeader: this.generatedOtpCode,
      message: 'New OTP generated.',
      buttons: ['Copy'],
    });

    await alert.present();
  }

  onUserChanged(event) {
    if (event && event.id) {
      this.otpConfigService.getUserApps(event.id).subscribe((response: App[]) => {
        this.apps = response;
      }, error => {
        console.log(error);
      });
    }
  }

  // Toggle date to
  toggleDateTo() {
    this.expiryDateActive = this.expiryDateActive ? false : true;
  }

  // On expiry date select
  expiryDateActive: boolean = false;
  expiryDate: any;
  onExpiryDateSelect(event: any) {
    let selectedDate = new Date(event.detail.value);
    this.date = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0));
    this.expiryDate = format(parseISO(event.detail.value), 'MMM d, yyyy');;
    this.expiryDateActive = false;
  }

  generateOtp() {
    if (this.selectedApp && this.selectedUser && this.selectedValidity) {
      let t = this.transformObjectToDto();
      this.otpConfigService.insertOtp(t).subscribe(async response => {
        if (response.status == 201) {
          this.generatedOtpCode = response.body['header'].otpCode;
          await this.presentAlert();
          this.toastService.presentToast('Success', 'New OTP has been created.', 'bottom', 'success', 1000);
        }
      }, error => {
        console.log(error);
        this.toastService.presentToast('Error', 'Please insert all fields.', 'bottom', 'danger', 1000);
      })
    }
    else {
      this.toastService.presentToast('Error', 'Please insert all fields.', 'bottom', 'danger', 1000);
    }
  }

  transformObjectToDto(): OtpDTO {
    let otpLineArray: OtpLine[] = [];
    let validity = this.selectedValidity
    switch (validity) {
      case "SINGLE": {
        let otpLine: OtpLine = {
          otpLineId: 0,
          otpId: 0,
          appCode: this.selectedApp,
          isUse: false
        }
        otpLineArray.push(otpLine);
        break;
      }
      case "MULTIPLE": {
        for (var x of this.selectedApp) {
          let otpLine: OtpLine = {
            otpLineId: 0,
            otpId: 0,
            appCode: x,
            isUse: false
          }
          otpLineArray.push(otpLine);
        }
        break;
      }
    }
    let otpDTO: OtpDTO = {
      header: {
        otpId: 0,
        otpCode: null,
        userId: this.selectedUser,
        validity: this.selectedValidity,
        expiredAt: null,
        status: null
      },
      details: otpLineArray
    };
    return otpDTO;
  }

}
