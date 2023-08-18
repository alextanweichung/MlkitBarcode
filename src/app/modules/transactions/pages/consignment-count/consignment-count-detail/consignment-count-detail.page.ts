import { Component, OnInit } from '@angular/core';
import { ConsignmentCountService } from '../../../services/consignment-count.service';
import { ConsignmentCountItem, ConsignmentCountRoot } from '../../../models/consignment-count';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-consignment-count-detail',
  templateUrl: './consignment-count-detail.page.html',
  styleUrls: ['./consignment-count-detail.page.scss'],
})
export class ConsignmentCountDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: ConsignmentCountRoot;
  objectDetail: ConsignmentCountItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: ConsignmentCountService
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
      this.objectDetail = [];
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
        this.object.details.forEach(r => {
          let barcodeTag = this.object.barcodeTag.find(rr => rr.itemSku === r.itemSku);
          this.objectDetail.push({
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
    this.navController.navigateForward('/transactions/consignment-count/consignment-count-header', navigationExtras);
  }

}
