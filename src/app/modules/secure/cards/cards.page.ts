import { AfterContentChecked, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
import { AlertController, IonRouterOutlet, LoadingController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AddPage } from '../../../modules/secure/cards/add/add.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
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

  card_details_visible: boolean = false;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private commonService: CommonService
  ) { }

  ngAfterContentChecked(): void {

    if (this.swiper) {
      this.swiper.updateSwiper({});
    }

  }

  // Sync
  async sync() {
    // Loading overlay
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Syncing Offline Table...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    await loading.present();

    this.commonService.syncAllItemByLocationCode().subscribe(async response => {
      let itemMaster: PDItemMaster[] = response['itemMaster'];
      let itemBarcode: PDItemBarcode[] = response['itemBarcode'];
      await this.configService.syncInboundData(itemMaster, itemBarcode);
    }, error => {
      console.log(error);
    })

    // Fake timeout
    setTimeout(() => {
      loading.dismiss();
    }, 2000);
  }

  // Add card
  async addCard() {

    // Open filter modal
    const modal = await this.modalController.create({
      component: AddPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    return await modal.present();
  }

  // Delete card
  async deleteCard() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Delete this card permanently?',
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: 'Delete card',
          cssClass: 'danger',
          handler: async () => {
            this.toastService.presentToast('Success', 'Card successfully deleted', 'bottom', 'success', 2000);
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
