import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { StockCountItem, StockCountRoot } from '../../../models/stock-count';
import { StockCountService } from '../../../services/stock-count.service';

@Component({
  selector: 'app-stock-count-detail',
  templateUrl: './stock-count-detail.page.html',
  styleUrls: ['./stock-count-detail.page.scss'],
})
export class StockCountDetailPage implements OnInit, ViewWillEnter {

  objectId: number;

  inventoryCount: StockCountRoot;
  scannedItems: StockCountItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private stockCountService: StockCountService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ionViewWillEnter(): void {
    if (this.objectId) {
      this.loadObject();
    }
  }
  
  ngOnInit() {
    this.loadMasterList();
  }

  locationMasterList: MasterListDetails[] = [];
  zoneMasterList: MasterListDetails[] = [];
  rackMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.stockCountService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.zoneMasterList = response.filter(x => x.objectName == 'Zone').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.rackMasterList = response.filter(x => x.objectName == 'Rack').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadObject() {
    this.scannedItems = [];
    this.stockCountService.getInventoryCount(this.objectId).subscribe(response => {
      this.inventoryCount = response;
      console.log("🚀 ~ file: stock-count-detail.page.ts:62 ~ StockCountDetailPage ~ this.stockCountService.getInventoryCount ~ this.inventoryCount", JSON.stringify(this.inventoryCount))
      this.inventoryCount.details.forEach(r => {
        let barcodeTag = this.inventoryCount.barcodeTag.find(rr => rr.itemSku === r.itemSku);
        this.scannedItems.push({
          itemId: r.itemId,
          itemCode: barcodeTag.itemCode,
          description: barcodeTag.description,
          variationTypeCode: barcodeTag.variationTypeCode,
          itemVariationLineXId: barcodeTag.itemVariationLineXId,
          itemVariationLineYId: barcodeTag.itemVariationLineYId,
          itemVariationLineXDescription: barcodeTag.itemVariationLineXDescription,
          itemVariationLineYDescription: barcodeTag.itemVariationLineYDescription,
          itemSku: barcodeTag.itemSku,
          itemBarcodeTagId: barcodeTag.itemBarcodeTagId,
          itemBarcode: barcodeTag.itemBarcode,
          itemUomId: barcodeTag.itemUomId,
          itemUomDescription: barcodeTag.itemUomDescription,
          qtyRequest: r.qtyRequest
        })
      })
      console.log("🚀 ~ file: stock-count-detail.page.ts:86 ~ StockCountDetailPage ~ this.stockCountService.getInventoryCount ~ this.scannedItems", JSON.stringify(this.scannedItems))
    }, error => {
      console.log(error);
    })
  }

  edit() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.objectId
      }
    }
    this.navController.navigateForward('/transactions/stock-count/stock-count-edit/stock-count-header', navigationExtras);
  }

}
