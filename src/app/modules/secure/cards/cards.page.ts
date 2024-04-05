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
import { format } from 'date-fns';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { DashboardService } from '../../dashboard/services/dashboard.service';

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
      public dashboardService: DashboardService,
      public configService: ConfigService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
   ) {
      this.currentVersion = environment.version;
   }

   ngOnInit(): void {
      if (this.configService.loginUser.loginUserType === "B") {
         this.userType = "Base User";
      } else if (this.configService.loginUser.loginUserType === "C") {
         this.userType = "Consignment User";
      } else if (this.configService.loginUser.loginUserType === "P") {
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
            await this.loadingService.showLoading();
            if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length > 1) {
               if (this.configService.selected_location) {
                  let response = await this.commonService.syncInboundConsignment(this.configService.selected_location, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
                  let itemMaster: LocalItemMaster[] = response["itemMaster"];
                  let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
                  await this.configService.syncInboundData(itemMaster, itemBarcode);

                  this.configService.selected_location = this.configService.loginUser.locationId[0];
                  let response2 = await this.commonService.syncMarginConfig(this.configService.loginUser.locationId[0]);
                  let marginConfig: LocalMarginConfig[] = response2;
                  await this.configService.syncMarginConfig(marginConfig);
                  await this.loadingService.dismissLoading();
               } else {
                  await this.loadingService.dismissLoading();
                  this.toastService.presentToast("Control Error", "Please select location before sync", "top", "warning", 1000);
                  this.showLocationModal();
               }
            }
            else if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 1) {
               // sync by location since only 1 location
               let response = await this.commonService.syncInboundConsignment(this.configService.loginUser.locationId[0], format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
               let itemMaster: LocalItemMaster[] = response["itemMaster"];
               let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
               await this.configService.syncInboundData(itemMaster, itemBarcode);

               this.configService.selected_location = this.configService.loginUser.locationId[0];
               let response2 = await this.commonService.syncMarginConfig(this.configService.loginUser.locationId[0]);
               let marginConfig: LocalMarginConfig[] = response2;
               await this.configService.syncMarginConfig(marginConfig);
               await this.loadingService.dismissLoading();
            } else if (this.configService.loginUser.loginUserType === "C" && this.configService.loginUser.locationId && this.configService.loginUser.locationId.length === 0) {
               // show error if consignment user but no location set
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Control Error", "Location not set, please contact adminstrator", "top", "warning", 1000);
            } else {
               // download item master for other user
               let response = await this.commonService.syncInbound();
               let itemMaster: LocalItemMaster[] = response["itemMaster"];
               let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
               await this.configService.syncInboundData(itemMaster, itemBarcode);
               await this.loadingService.dismissLoading();
            }
         } catch (error) {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast(error.message, "", "top", "medium", 1000);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }
   }

   /* #region select location modal */

   selectLocationModal: boolean = false;
   showLocationModal() {
      this.selectLocationModal = true;
   }

   hideLocationModal() {
      this.selectLocationModal = false;
   }

   async setDefaultLocation(location: MasterListDetails) {
      this.configService.selected_location = location.id;
      this.hideLocationModal();
      if (Capacitor.getPlatform() !== "web") {
         try {
            await this.loadingService.showLoading("Downloading resources");
            let response = await this.commonService.syncInboundConsignment(this.configService.selected_location, format(this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), "yyyy-MM-dd"));
            let itemMaster: LocalItemMaster[] = response["itemMaster"];
            let itemBarcode: LocalItemBarcode[] = response["itemBarcode"];
            await this.configService.syncInboundData(itemMaster, itemBarcode);

            if (this.configService.loginUser.loginUserType === "C") {
               let response2 = await this.commonService.syncMarginConfig(this.configService.selected_location);
               let marginConfig: LocalMarginConfig[] = response2;
               await this.configService.syncMarginConfig(marginConfig);
            }
            await this.loadingService.dismissLoading();
         } catch (e) {
            await this.loadingService.dismissLoading();
            console.error(e);
         } finally {
            await this.loadingService.dismissLoading();
         }
      }
   }

   /* #endregion */

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
