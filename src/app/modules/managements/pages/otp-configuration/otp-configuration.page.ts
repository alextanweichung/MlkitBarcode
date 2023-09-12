import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { User } from 'src/app/shared/models/user';
import { OtpDTO, Otp, OtpLine } from '../../models/otp';
import { OtpService } from '../../services/otp.service';
import { App } from 'src/app/shared/models/app';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { AlertController, ViewWillEnter } from '@ionic/angular';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CalendarInputPage } from 'src/app/shared/pages/calendar-input/calendar-input.page';
import { SearchMultiDropdownPage } from 'src/app/shared/pages/search-multi-dropdown/search-multi-dropdown.page';
import { format } from 'date-fns';

@Component({
  selector: 'app-otp-configuration',
  templateUrl: './otp-configuration.page.html',
  styleUrls: ['./otp-configuration.page.scss'],
})
export class OtpConfigurationPage implements OnInit, ViewWillEnter {

  lovStatics: MasterListDetails[] = [];
  apps: App[] = [];
  allApps: App[] = [];

  otps: Otp[] = [];
  otpsToShow: Otp[] = [];
  generatedOtpCode: string;
  selectedOtp: Otp;

  selectedUser: any;
  selectedValidity: any;
  selectedApp: any;

  expiryDate: Date = this.commonService.getTodayDate();
  remark: string = null;

  checkboxValue: boolean = true;

  userSearchDropDownList: SearchDropdownList[] = [];
  validitySerachDropdownList: SearchDropdownList[] = [];
  appsSearchDropdownList: SearchDropdownList[] = [];

  @ViewChild('usersDropdown', { static: false }) usersDropdown: SearchDropdownPage;
  @ViewChild('validityDropdown', { static: false }) validityDropdown: SearchDropdownPage;
  @ViewChild('appsDropdown', { static: false }) appsDropdown: SearchDropdownPage;
  @ViewChild('appsMultiDropdown', { static: false }) appsMultiDropdown: SearchMultiDropdownPage;
  @ViewChild('calendar', { static: false }) calendar: CalendarInputPage;

  constructor(
    private toastService: ToastService,
    private otpConfigService: OtpService,
    private commonService: CommonService,
    private alertController: AlertController,
  ) { }

  ionViewWillEnter(): void {
    if (!this.expiryDate) {
      this.expiryDate = this.commonService.getTodayDate();
    }
  }

  ngOnInit() {
    this.loadUsers();
    this.loadOtps();
    this.loadCommonData();
  }

  users: User[] = [];
  loadUsers() {
    this.otpConfigService.getDescendantUser().subscribe(response => {
      this.users = response;
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
          code: r.userName[0],
          description: r.userName
        })
      })
    }, error => {
      console.log(error);
    })

    this.otpConfigService.getStaticLov().subscribe(response => {
      this.lovStatics = response.filter(x => x.objectName == 'OtpValidity' && x.details != null).flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })

    this.otpConfigService.getAllApps().subscribe(response => {
      this.allApps = response;
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
      header: this.generatedOtpCode,
      subHeader: 'New OTP generated.',
      buttons: [{
        text: 'Copy',
        handler: () => {
          this.copyMessage(this.generatedOtpCode);
        },
      }
      ],
    });
    await alert.present();
  }

  onUserChanged(event) {
    if (event && event.id) {
      this.selectedUser = event.id;
      this.otpConfigService.getUserApps(event.id).subscribe((response: App[]) => {
        this.apps = response;
        this.apps.forEach(r => {
          this.appsSearchDropdownList.push({
            id: r.appId,
            code: r.appCode,
            description: r.appName
          })
        })
      }, error => {
        console.log(error);
      });
    } else {
      this.selectedUser = null;
    }
  }

  onValidityChanged(event) {
    if (event) {
      this.selectedValidity = event.code;
      this.selectedApp = null;
    }
  }

  onAppChanged(event) {
    if (this.selectedValidity && this.selectedValidity === 'SINGLE') {
      if (event) {
        this.selectedApp = event.code;
      } else {
        this.selectedApp = null
      }
    }
    if (this.selectedValidity && this.selectedValidity === 'MULTIPLE') {
      if (event && event.length > 0) {
        this.selectedApp = event.flatMap(r => r.code);
      } else {
        this.selectedApp = null
      }
    }
  }

  onDateSelected(event: Date) {
    if (event) {
      this.expiryDate = event;
      console.log("🚀 ~ file: otp-configuration.page.ts:175 ~ OtpConfigurationPage ~ onDateSelected ~ this.expiryDate:", this.expiryDate)
    }
  }

  onCheckBoxChecked(event) {
    if (event && event.detail.checked) {
      this.expiryDate = null;
    }
  }

  generateOtp() {
    if (this.selectedApp && this.selectedUser && this.selectedValidity) {
      let t = this.transformObjectToDto();
      console.log("🚀 ~ file: otp-configuration.page.ts:188 ~ OtpConfigurationPage ~ generateOtp ~ t:", t)
      this.otpConfigService.insertOtp(t).subscribe(async response => {
        if (response.status == 201) {
          this.generatedOtpCode = response.body['header'].otpCode;
          await this.presentAlert();
          this.toastService.presentToast('Success', 'New OTP has been created.', 'top', 'success', 1000);
          this.resetOtpInputFields();
        }
      }, error => {
        console.log(error);
        this.toastService.presentToast('Error', 'Please insert all fields.', 'top', 'danger', 1000);
      })
    }
    else {
      this.toastService.presentToast('Error', 'Please insert all fields.', 'top', 'danger', 1000);
    }
  }

  onPageChanged(event) {
    this.otpsToShow = [];
    for (let index = event.first; index < (event.first + event.rows); index++) {
      if (index < this.otps.length) {
        const element = this.otps[index];
        this.otpsToShow.push(element);
      }
    }
  }

  showLines(otpId: number) {
    this.selectedOtp = this.otps.find(r => r.otpId === otpId);
    this.otpConfigService.getOtpLines(otpId).subscribe((response: OtpLine[]) => {
      // this.otpLines = response;
    }, error => {
      console.log(error);
    })
  }

  resetOtpInputFields() {
    this.selectedUser = null;
    this.usersDropdown.clearSelected();
    this.selectedApp = null;
    this.validityDropdown.clearSelected();
    this.selectedValidity = null;
    this.appsDropdown.clearSelected();
    this.appsMultiDropdown.clearSelected();
    this.expiryDate = new Date();
    this.checkboxValue = true;
    this.remark = null;
  }

  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
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
        expiredAt: this.checkboxValue ? null : format(this.expiryDate, "dd/MM/yyyy HH:mm:ss"),
        status: null,
        remark: this.remark
      },
      details: otpLineArray
    };
    return otpDTO;
  }

}
