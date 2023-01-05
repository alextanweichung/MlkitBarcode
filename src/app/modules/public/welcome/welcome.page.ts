import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
SwiperCore.use([Pagination]);

import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingController, NavController } from '@ionic/angular';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomePage implements OnInit, AfterContentChecked {

  language: string = '';
  last_slide: boolean = false;
  showImage: boolean = true;

  @ViewChild('swiper') swiper: SwiperComponent;

  // Swiper config
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: false,
    allowTouchMove: false // set true to allow swiping
  }

  constructor(
    private toastService: ToastService,
    private configService: ConfigService,
    private navController: NavController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    Keyboard.addListener('keyboardWillShow', () => {
      this.showImage = false;
    })

    Keyboard.addListener('keyboardWillHide', () => {
      this.showImage = true;
    })
  }

  ngAfterContentChecked(): void {
    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
  }

  // Trigger swiper slide change
  swiperSlideChanged(e) {
    // console.log(e);
  }

  // Go to next slide
  nextSlide() {
    this.swiper.swiperRef.slideNext(500);
  }

  // Last slide trigger
  onLastSlide() {
    this.last_slide = true;
  }

  uppercase(code: string) {
    this.activationCode = code.toUpperCase();
  }

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  onKeyPress(event) {
    console.log("🚀 ~ file: welcome.page.ts:83 ~ WelcomePage ~ onKeyPress ~ event", JSON.stringify(event))
    if (event.keyCode === 13) {
      this.getStarted();
      event.preventDefault();
    }
  }

  activationCode: string = '';
  // Go to main content
  async getStarted() {
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Getting Info...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    if (this.activationCode.length > 0) {
      try {
        // Loading overlay
        await loading.present();
        this.configService.getApiUrl(this.activationCode).subscribe(async response => {
          if (response) {
            let config: Sys_Parameter = {
              Sys_ParameterId: 1,
              apiUrl: response.fields.url.stringValue,
              onlineMode: true,
              loadImage: false
            }
            this.toastService.presentToast('Activated Successfully', '', 'top', 'success', 1000);
            await this.configService.insert(config).then(response => {
              loading.dismiss();
              this.navController.navigateRoot('/signin');
            }).catch(error => {
              loading.dismiss();
              this.toastService.presentToast(error.message, '', 'top', 'danger', 1000);
            });
          }
        }, error => {
          loading.dismiss();
          this.toastService.presentToast('Invalid activation code', '', 'top', 'danger', 1000);          
        })
      } catch (error) {
        loading.dismiss();
      }
    } else {
      this.toastService.presentToast('Please enter activation code', '', 'top', 'danger', 1000);
    }
  }

}
