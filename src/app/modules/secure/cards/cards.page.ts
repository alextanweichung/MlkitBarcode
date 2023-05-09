import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit, AfterContentChecked {

  @ViewChild('swiper') swiper: SwiperComponent;

  // Swiper config
  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: { clickable: false },
    allowTouchMove: true
  }

  last_sync_datetime: Date;

  companyInfo: any;
  loginName: string;
  loginEmail: string;
  userType: string;
  current_year: number = new Date().getFullYear();
  currentVersion: string;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastService: ToastService,
    // private loadingService: LoadingService,
    private commonService: CommonService
  ) {
    this.currentVersion = environment.version;
  }

  ngOnInit(): void {
    let loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if (loginUser.loginUserType === 'B') {
      this.userType = "Base User";
    } else if (loginUser.loginUserType === 'C') {
      this.userType = "Consignment User";
    } else if (loginUser.loginUserType === 'P') {
      this.userType = "POS User";
    }
    this.authService.currentUserToken$.subscribe(obj => {
      let decodedToken = obj;
      if (decodedToken != null) {
        this.loginName = decodedToken.unique_name;
        this.loginEmail = decodedToken.email;
      }
    })
    this.commonService.getCompanyProfile().subscribe(response => {
      this.companyInfo = response;
    }, error => {
      console.log(error);
    })
  }

  ngAfterContentChecked(): void {
    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
    this.last_sync_datetime = this.configService.sys_parameter.lastDownloadAt;
  }

  // Sync
  async sync() {
    if (Capacitor.getPlatform() !== 'web') {
      try {
        // await this.loadingService.showLoading("Syncing Offline Table");
        let response = await this.commonService.syncInbound();
        let itemMaster: PDItemMaster[] = response['itemMaster'];
        let itemBarcode: PDItemBarcode[] = response['itemBarcode'];
        await this.configService.syncInboundData(itemMaster, itemBarcode);
        // await this.configService.loadItemMaster();
        // await this.configService.loadItemBarcode();
        // await this.loadingService.dismissLoading();
      } catch (error) {
        // await this.loadingService.dismissLoading();
        this.toastService.presentToast(error.message, '', 'top', 'medium', 1000);
      }
    }
  }

  async signOut() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Sign-out?',
      buttons: [
        {
          text: 'Sign-out',
          cssClass: 'danger',
          handler: async () => {
            this.authService.signOut();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel'
        }
      ]
    });

    await alert.present();
  }

}
