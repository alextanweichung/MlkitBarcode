import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
SwiperCore.use([Pagination]);

import { ConfigService } from 'src/app/services/config/config.service';
import { NavController } from '@ionic/angular';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';

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
    pagination: { clickable: false },
    allowTouchMove: false // set true to allow swiping
  }

  constructor(
    private configService: ConfigService,
    private navController: NavController
  ) { }

  ngOnInit() {
    if (this.configService.sys_parameter) {
      this.navController.navigateRoot('/signin');
    }
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
      let code = atob(this.activationCode);
      let config: Sys_Parameter = JSON.parse(code);
      await this.configService.insert(config);
    }
    // Navigate to /home
    this.navController.navigateRoot('/signin');
  }

  // async insertConfig(config: Config) {
  //   console.log(`inserting config`);
  //   await this.configService.insertConfig(config);
  // }

}
