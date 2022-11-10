import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { StockCountItem, StockCountRoot } from '../../../models/stock-count';
import { StockCountService } from '../../../services/stock-count.service';

@Component({
  selector: 'app-stock-count-detail',
  templateUrl: './stock-count-detail.page.html',
  styleUrls: ['./stock-count-detail.page.scss'],
})
export class StockCountDetailPage implements OnInit {

  inventoryCountId: number;

  inventoryCount: StockCountRoot;
  scannedItems: StockCountItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService,
    private stockCountService: StockCountService
  ) {
    this.route.queryParams.subscribe(params => {
      this.inventoryCountId = params['inventoryCountId'];
    })
  }

  ngOnInit() {
    this.loadMasterList();
    if (this.inventoryCountId) {
      this.loadObject();
    }
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
    this.stockCountService.getInventoryCount(this.inventoryCountId).subscribe(response => {
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
      console.log(error);
    })
  }

}
