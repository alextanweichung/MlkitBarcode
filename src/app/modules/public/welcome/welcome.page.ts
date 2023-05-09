import { AfterContentChecked, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
SwiperCore.use([Pagination]);

import { ConfigService } from 'src/app/services/config/config.service';
import { NavController } from '@ionic/angular';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingService } from 'src/app/services/loading/loading.service';

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
    // private loadingService: LoadingService,
    private navController: NavController
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
    if (event.keyCode === 13) {
      this.getStarted();
      event.preventDefault();
    }
  }

  activationCode: string = '';
  // Go to main content
  async getStarted() {
    if (this.activationCode.length > 0) {
      try {
        // Loading overlay
        // await this.loadingService.showLoading("Getting Info");
        this.configService.getApiUrl(this.activationCode).subscribe(async response => {
          if (response) {
            this.toastService.presentToast('Activated Successfully', '', 'top', 'success', 1000);
            let config: Sys_Parameter = {
              Sys_ParameterId: 1,
              apiUrl: response.fields.url.stringValue,
              rememberMe: false,
              username: '',
              password: ''
            }
            await this.configService.insert(config).then(async response => {
              // await this.loadingService.dismissLoading();
              this.navController.navigateRoot('/signin');
            }).catch(async error => {
              // await this.loadingService.dismissLoading();
              this.toastService.presentToast(error.message, '', 'top', 'danger', 1000);
            });
          }
        }, async error => {
          // await this.loadingService.dismissLoading();
          this.toastService.presentToast('Invalid activation code', '', 'top', 'danger', 1000);
        })
      } catch (error) {
        // await this.loadingService.dismissLoading();
      }
    } else {
      this.toastService.presentToast('Please enter activation code', '', 'top', 'danger', 1000);
    }
  }

}
