import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
SwiperCore.use([Pagination]);

import { ConfigService } from 'src/app/services/config/config.service';
import { NavController } from '@ionic/angular';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WelcomePage implements OnInit, AfterContentChecked {

  language: string = '';
  last_slide: boolean = false;

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
    private navController: NavController
  ) { }

  ngOnInit() {

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

  activationCode: string = '';
  // Go to main content
  async getStarted() {
    if (this.activationCode.length > 0) {
      try {
        // let code = atob(this.activationCode);
        // let config: Sys_Parameter = JSON.parse(code);
        // this.configService.getApiUrl(this.activationCode).subscribe(async response => {
        //   console.log("🚀 ~ file: welcome.page.ts:85 ~ WelcomePage ~ this.configService.getApiUrl ~ response", JSON.stringify(response))
        //   if (response) {
            let config: Sys_Parameter = {
              Sys_ParameterId: 1,
              apiUrl: 'https://idcp-demo.com/api/', // response.fields.url.stringValue,
              onlineMode: true,
              loadImage: false
            }
            await this.configService.insert(config).then(response => {
              this.navController.navigateRoot('/signin');
            }).catch(error => {
              this.toastService.presentToast(error.message, '', 'top', 'danger', 1000);
            });
        //   }
        // }, error => {
        //   console.log(JSON.stringify(error));
        // })
      } catch (error) {
        this.toastService.presentToast('Invalid activation code', '', 'top', 'danger', 1000);
      }
    } else {
      this.toastService.presentToast('Please enter activation code', '', 'top', 'danger', 1000);
    }
  }

  // async insertConfig(config: Config) {
  //   console.log(`inserting config`);
  //   await this.configService.insertConfig(config);
  // }

}
