import { Component, OnInit } from '@angular/core';
import { ConsignmentCountService } from '../../../services/consignment-count.service';
import { ConsignmentCountRoot } from '../../../models/consignment-count';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-consignment-count-detail',
  templateUrl: './consignment-count-detail.page.html',
  styleUrls: ['./consignment-count-detail.page.scss'],
})
export class ConsignmentCountDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: ConsignmentCountRoot;
  currentPage: number = 1;

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

  async loadObject() {
    try {
      await this.loadingService.showLoading();
      this.objectService.getObjectById(this.objectId).subscribe(async response => {
        this.object = response;
        this.object.header = this.commonService.convertObjectAllDateType(this.object.header);
        this.object.details.forEach(r => {
          let found = this.object.barcodeTag.find(rr => rr.itemSku === r.itemSku);
          if (found) {
            r.itemCode = found.itemCode,
            r.itemDescription = found.description,
            r.itemVariationXDescription = found.itemVariationLineXDescription,
            r.itemVariationYDescription = found.itemVariationLineYDescription,
            r.guid = uuidv4()
          }
        })
        await this.objectService.setHeader(JSON.parse(JSON.stringify(this.object.header)));
        await this.objectService.setLines(JSON.parse(JSON.stringify(this.object.details)));
        await this.loadingService.dismissLoading();
      }, async error => {
        await this.loadingService.dismissLoading();
        console.error(error);
      })
    } catch (e) {
      await this.loadingService.dismissLoading();
      console.error(e);
    } finally {
      await this.loadingService.dismissLoading();
    }
  }

  edit() {
    this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");
  }

  previousStep() {
    this.objectService.resetVariables();
    this.navController.navigateBack("/transactions/consignment-count");
  }

  identify(index, line) {
    return line.guid;
  }

}
