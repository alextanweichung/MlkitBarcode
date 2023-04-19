import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ViewWillEnter } from '@ionic/angular';
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
    public objectService: StockCountService
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
    
  }

  loadObject() {
    try {
      this.scannedItems = [];
      this.objectService.getInventoryCount(this.objectId).subscribe(response => {
        this.inventoryCount = response;
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
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
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
