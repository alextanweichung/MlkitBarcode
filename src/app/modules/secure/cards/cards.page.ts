import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { SwiperOptions, Pagination } from 'swiper';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LocalItemBarcode, LocalItemMaster, LocalMarginConfig } from 'src/app/shared/models/pos-download';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { LoginUser } from 'src/app/services/auth/login-user';
import { format } from 'date-fns';

SwiperCore.use([Pagination]);

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit, AfterContentChecked {

  @ViewChild("swiper") swiper: SwiperComponent;

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

  loginUser: LoginUser;
  ngOnInit(): void {
    this.loginUser = JSON.parse(localStorage.getItem("loginUser"));
    if (this.loginUser.loginUserType === "B") {
      this.userType = "Base User";
    } else if (this.loginUser.loginUserType === "C") {
      this.userType = "Consignment User";
    } else if (this.loginUser.loginUserType === "P") {
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
    this.loadMasterList();
  }

  ngAfterContentChecked(): void {
    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
    this.last_sync_datetime = this.configService.selected_sys_param.lastDownloadAt;
  }

  procurementAgentMasterList: MasterListDetails[] = [];
  warehouseAgentMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.commonService.getAgentsMasterList().subscribe(response => {
      this.procurementAgentMasterList = response.filter(x => x.objectName == "ProcurementAgent" && x.details != null).flatMap(src => src.details);      
      this.warehouseAgentMasterList = response.filter(x => x.objectName == "WarehouseAgent" && x.details != null).flatMap(src => src.details);      
      this.salesAgentMasterList = response.filter(x => x.objectName == "SalesAgent" && x.details != null).flatMap(src => src.details);
    }, error => {
      console.error(error);
    })
  }

  // Sync
  async sync() {
    if (Capacitor.getPlatform() !== "web") {
      try {
        let loginUser = JSON.parse(localStorage.getItem("loginUser")) as LoginUser;
        if (loginUser.loginUserType === "C" && loginUser.locationId && loginUser.locationId.length > 1) {
          if (this.configService.selected_consignment_location) {
            let response = await this.commonService.syncInboundConsignment(this.configService.selected_consignment_location, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
            let itemMaster: LocalItemMaster[] = response["itemMaster"];
            let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
            await this.configService.syncInboundData(itemMaster, itemBarcode);
              
            this.configService.selected_consignment_location = loginUser.locationId[0];
            let response2 = await this.commonService.syncMarginConfig(loginUser.locationId[0]);
            let marginConfig: LocalMarginConfig[] = response2;
            await this.configService.syncMarginConfig(marginConfig);
          }
        }
        else if (loginUser.loginUserType === "C" && loginUser.locationId && loginUser.locationId.length === 1) {    
          // sync by location since only 1 location
          let response = await this.commonService.syncInboundConsignment(loginUser.locationId[0], format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
          let itemMaster: LocalItemMaster[] = response["itemMaster"];
          let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
          await this.configService.syncInboundData(itemMaster, itemBarcode);
            
          this.configService.selected_consignment_location = loginUser.locationId[0];
          let response2 = await this.commonService.syncMarginConfig(loginUser.locationId[0]);
          let marginConfig: LocalMarginConfig[] = response2;
          await this.configService.syncMarginConfig(marginConfig);
        } else if (loginUser.loginUserType === "C" && loginUser.locationId && loginUser.locationId.length === 0) {
          // show error if consignment user but no location set
          this.toastService.presentToast("", "Consignment Location not set", "top", "warning", 1000);
        } else {
          // download item master for other user
          let response = await this.commonService.syncInbound();
          let itemMaster: LocalItemMaster[] = response["itemMaster"];
          let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
          await this.configService.syncInboundData(itemMaster, itemBarcode);
        }
      } catch (error) {
        this.toastService.presentToast(error.message, "", "top", "medium", 1000);
      }
    }
  }

  async addNewActivation() {
    const alert = await this.alertController.create({
      cssClass: "custom-alert",
      header: "New Activation?",
      subHeader: "You'll be signed out to do this!",
      buttons: [
        {
          text: "Sign-out",
          cssClass: "danger",
          handler: async () => {
            this.authService.signOut(true);
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "cancel"
        }
      ]
    });

    await alert.present();
  }

  async signOut() {
    const alert = await this.alertController.create({
      cssClass: "custom-alert",
      header: "Sign-out?",
      buttons: [
        {
          text: "Sign-out",
          cssClass: "danger",
          handler: async () => {
            await this.authService.signOut();
            await this.configService.signOut();
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "cancel"
        }
      ]
    });

    await alert.present();
  }

}
