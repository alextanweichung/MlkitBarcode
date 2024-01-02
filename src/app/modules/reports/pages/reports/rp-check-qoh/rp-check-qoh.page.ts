import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CheckQohRoot } from '../../../models/rp-check-qoh';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-rp-check-qoh',
   templateUrl: './rp-check-qoh.page.html',
   styleUrls: ['./rp-check-qoh.page.scss'],
})
export class RpCheckQohPage implements OnInit {

   objects: CheckQohRoot[] = [];
   loginUser: any;
   columns: any;

   constructor(
      private authService: AuthService,
      private objectService: ReportsService,
      private toastService: ToastService,
      private loadingService: LoadingService
   ) {
      this.loginUser = JSON.parse(localStorage.getItem("loginUser"));
   }

   ngOnInit() {
      this.columns = [
         { prop: "itemCode", name: "Stock Code", draggable: false },
         { prop: "itemDescription", name: "Description", draggable: false },
         { prop: "qoh", name: "QOH", draggable: false },
         { prop: "price", name: "Price", draggable: false }
      ]
   }

   itemSearchText: string;
   async search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.objects = [];
         this.realObject = [];
      }
      this.itemSearchText = searchText;
      try {
         await this.loadingService.showLoading();
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.objectService.getCheckQoh(searchText, this.loginUser.loginUserType, this.loginUser.salesAgentId).subscribe(async response => {
               this.objects = response;
               console.log("🚀 ~ file: rp-check-qoh.page.ts:54 ~ RpCheckQohPage ~ this.objectService.getCheckQoh ~ this.objects:", JSON.stringify(this.objects))
               // let blob = new Blob([JSON.stringify(this.objects)], {type: "text/plain"});
               // this.file.writeFile(this.file.dataDirectory, "debug", blob, { replace: true, append: false });
               await this.massageData();
               await this.loadingService.dismissLoading();
               this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 300, true);
            })
         } else {
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   realObject: any[] = [];
   async massageData() {
      this.realObject = [];

      for await (const r of this.objects) {
         let price: any[] = [];
         for await (const rr of r.segmentPricing) {
            price.push({
               segmentCode: rr.itemPricing.priceSegmentCode,
               price: rr.itemPricing.unitPrice
            })
         }
         this.realObject.push({
            itemCode: r.itemCode,
            itemDescription: r.itemDescription,
            qoh: r.inventoryLevel.reduce((a, c) => a + (c.qty - c.openQty), 0),
            price: price
         })
         console.log("🚀 ~ file: rp-check-qoh.page.ts:91 ~ RpCheckQohPage ~ forawait ~ this.realObject:", JSON.stringify(this.realObject))
      }

      // this.objects.forEach(r => {
      //    let price: any[] = [];
      //    r.segmentPricing.forEach(rr => {
      //       price.push({
      //          segmentCode: rr.itemPricing.priceSegmentCode,
      //          price: rr.itemPricing.unitPrice
      //       })
      //    })
      //    this.realObject.push({
      //       itemCode: r.itemCode,
      //       itemDescription: r.itemDescription,
      //       qoh: r.inventoryLevel.reduce((a, c) => a + (c.qty - c.openQty), 0),
      //       price: price
      //    })
      // })
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

}
