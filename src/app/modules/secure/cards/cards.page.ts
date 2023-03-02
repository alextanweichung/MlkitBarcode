import { AfterContentChecked, Component, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
import { AlertController, LoadingController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { Capacitor } from '@capacitor/core';
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements AfterContentChecked {

  @ViewChild('swiper') swiper: SwiperComponent;

  // Swiper config
  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: { clickable: false },
    allowTouchMove: true
  }

  show_item_image: boolean = false;
  online_mode: boolean = false;
  last_sync_datetime: Date;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private commonService: CommonService
  ) { }

  ngAfterContentChecked(): void {
    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
    this.show_item_image = this.configService.sys_parameter.loadImage;
    this.online_mode = this.configService.sys_parameter.onlineMode;
    this.last_sync_datetime = this.configService.sys_parameter.lastDownloadAt;
  }

  // Sync
  async sync() {
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Syncing Offline Table...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
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
  }

  async toggleShowItemImage(event) {
    if (Capacitor.getPlatform() !== 'web') {
      let t = this.configService.sys_parameter;
      t.loadImage = event.detail.checked;
      try {
        await this.configService.update(t);
        this.configService.load();
      } catch (error) {
        this.toastService.presentToast(error.message, '', 'top', 'medium', 1000);
      }
    }
  }

  async toggleUseOnlineResources(event) {
    if (Capacitor.getPlatform() !== 'web') {
      let t = this.configService.sys_parameter;
      t.onlineMode = event.detail.checked;
      try {
        await this.configService.update(t);
        this.configService.load();
        if (!t.onlineMode) {
          await this.configService.loadItemBarcode()
          await this.configService.loadItemMaster();
        }
      } catch (error) {
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
