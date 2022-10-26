import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { SalesOrderLine } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  parent: string = 'Sales Order'

  salesOrderId: number;
  salesOrder: any;
  flattenSalesOrder: any;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    private salesOrderService: SalesOrderService
  ) {
    this.route.queryParams.subscribe(params => {
      this.salesOrderId = params['salesOrderId'];
      if (params['parent']) {
        this.parent = params['parent'];
      }
    })
  }

  ngOnInit() {
    if (!this.salesOrderId) {
      this.toastService.presentToast('Something went wrong!', '', 'top', 'danger', 1500);
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
    this.salesOrderService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadDetail() {
    this.salesOrderService.getSalesOrderDetail(this.salesOrderId).subscribe(response => {
      this.salesOrder = response;
      this.flattenSalesOrder = this.salesOrderService.unflattenDtoDetail(this.salesOrder);
    }, error => {
      console.log(error);
    })
  }

  matchImage(itemId: number) {
    let defaultImageUrl = "assets/icon/favicon.png";
    // let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
    // if (lookup) {
    //   return "data:image/png;base64, " + lookup;
    // }
    return defaultImageUrl;
  }

  getFlattenVariations(itemId: number): SalesOrderLine[] {
    return this.flattenSalesOrder.details.filter(r => r.itemId === itemId);
  }
}
