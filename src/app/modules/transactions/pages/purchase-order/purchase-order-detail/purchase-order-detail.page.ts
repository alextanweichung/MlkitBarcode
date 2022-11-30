import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PurchaseOrderLine } from '../../../models/purchase-order';
import { PurchaseOrderService } from '../../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-detail',
  templateUrl: './purchase-order-detail.page.html',
  styleUrls: ['./purchase-order-detail.page.scss'],
})
export class PurchaseOrderDetailPage implements OnInit {

  parent: string = 'Purchase Order'

  purchaseOrderId: number;
  purchaseOrder: any;
  flattenPurchaseOrder: any;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService,
    private purchaseOrderService: PurchaseOrderService
  ) {
    this.route.queryParams.subscribe(params => {
      this.purchaseOrderId = params['purchaseOrderId'];
      if (params['parent']) {
        this.parent = params['parent'];
      }
    })
  }

  ngOnInit() {
    if (!this.purchaseOrderId) {
      this.toastService.presentToast('Something went wrong!', '', 'middle', 'danger', 1000);
      this.navController.navigateBack('/transactions')
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
  }

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.purchaseOrderService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadDetail() {
    this.purchaseOrderService.getPurchaseOrderDetail(this.purchaseOrderId).subscribe(response => {
      this.purchaseOrder = response;
      this.flattenPurchaseOrder = this.purchaseOrderService.unflattenDtoDetail(this.purchaseOrder);
    }, error => {
      console.log(error);
    })
  }

  getFlattenVariations(itemId: number): PurchaseOrderLine[] {
    return this.flattenPurchaseOrder.details.filter(r => r.itemId === itemId);
  }

}
