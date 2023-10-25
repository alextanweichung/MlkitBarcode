import { Component, OnInit } from '@angular/core';
import { ConsignmentCountService } from '../../../services/consignment-count.service';
import { ConsignmentCountRoot } from '../../../models/consignment-count';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-consignment-count-detail',
  templateUrl: './consignment-count-detail.page.html',
  styleUrls: ['./consignment-count-detail.page.scss'],
})
export class ConsignmentCountDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: ConsignmentCountRoot;

  constructor(
    public objectService: ConsignmentCountService,
    private commonService: CommonService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private navController: NavController,
  ) { }

  ionViewWillEnter(): void {
    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"];
      if (this.objectId) {
        this.loadObject();
      }
    })
  }

  ngOnInit() {

  }

  loadObject() {
    try {
      this.loadingService.showLoading();
      this.objectService.getObjectById(this.objectId).subscribe(async response => {
        this.object = response;
        this.object.header = this.commonService.convertObjectAllDateType(this.object.header);
        this.object.details.forEach(r => {
          let found = this.object.barcodeTag.find(rr => rr.itemSku === r.itemSku);
          if (found) {
            r.itemCode = found.itemCode,
            r.itemDescription = found.description,
            r.itemVariationXDescription = found.itemVariationLineXDescription,
            r.itemVariationYDescription = found.itemVariationLineYDescription
          }
        })
        await this.objectService.setHeader(JSON.parse(JSON.stringify(this.object.header)));
        await this.objectService.setLines(JSON.parse(JSON.stringify(this.object.details)));
      }, error => {
        throw error;
      })
    } catch (e) {
      this.loadingService.dismissLoading();
      console.error(e);
    } finally {      
      this.loadingService.dismissLoading();
    }
  }

  edit() {
    // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     objectId: this.objectId
    //   }
    // }
    this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");//, navigationExtras);
  }

  previousStep() {
    this.objectService.resetVariables();
    this.navController.navigateBack("/transactions/consignment-count");
  }

}
