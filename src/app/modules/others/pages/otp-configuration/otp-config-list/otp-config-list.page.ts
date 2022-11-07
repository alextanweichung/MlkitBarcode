import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { OtpService } from '../../../services/otp.service';

@Component({
  selector: 'app-otp-config-list',
  templateUrl: './otp-config-list.page.html',
  styleUrls: ['./otp-config-list.page.scss'],
})
export class OtpConfigListPage implements OnInit {

  otpId: OtpConfigListPage

  constructor(
    private commonService: CommonService,
    private otpService: OtpService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // loadOtplines() {    
    //   this.otpService.getOtpLines(this.otpId).subscribe(response => {
    //     this.objects = response;
    //     if (this.objects.length > 0) {
    //       this.content_loaded = true;
    //     }
    //     // this.toastService.presentToast('Search Completed.', '', 'bottom', 'success', 1000);
    //   }, error => {
    //     console.log((error));
    //   })
    // }
  }

}
