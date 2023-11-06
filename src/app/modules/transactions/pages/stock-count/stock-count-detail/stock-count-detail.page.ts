import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { StockCountService } from '../../../services/stock-count.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-stock-count-detail',
  templateUrl: './stock-count-detail.page.html',
  styleUrls: ['./stock-count-detail.page.scss'],
})
export class StockCountDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  currentPage: number = 1;
  itemsPerPage: number = 12;

  constructor(
    public objectService: StockCountService,
    private commonService: CommonService,
    private loadingService: LoadingService,
    private navController: NavController,
    private route: ActivatedRoute,
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
      this.objectService.getInventoryCount(this.objectId).subscribe(async response => {
        let object = response;
        object.header = this.commonService.convertObjectAllDateType(object.header);
        object.details.forEach(r => {
          let found = object.barcodeTag.find(rr => rr.itemSku === r.itemSku);
          if (found) {
            r.itemCode = found.itemCode;
            r.itemDescription = found.description;
            r.itemVariationXDescription = found.itemVariationLineXDescription;
            r.itemVariationYDescription = found.itemVariationLineYDescription;
            r.guid = uuidv4();
          }
        })
        await this.objectService.setHeader(object.header);
        await this.objectService.setLines(object.details);
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
    this.navController.navigateRoot("/transactions/stock-count/stock-count-crud/stock-count-header");
  }

  identify(index, line) {
    return line.guid;
  }

}
