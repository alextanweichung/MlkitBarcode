import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { GoodsPackingList } from '../../models/packing';
import { GoodsPickingList } from '../../models/picking';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';
import { ConsignmentSalesService } from '../../services/consignment-sales.service';
import { PackingService } from '../../services/packing.service';
import { PickingService } from '../../services/picking.service';
import { QuotationService } from '../../services/quotation.service';
import { SalesOrderService } from '../../services/sales-order.service';

const pageCode: string = 'MATR';
const mobileQuotationCode: string = 'MATRQU';
const mobileSalesOrderCode: string = 'MATRSO';
const mobilePickingCode: string = 'MATRPI';
const mobilePackingCode: string = 'MATRPA';
const mobileConsignmentSalesCode: string = 'MATRCS';
const mobileInventoryCountCode: string = 'MATRST';
const mobileInventoryLevelCode: string = 'MATRIL';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

  showQuotation: boolean = false;
  quotations: QuotationList[] = [];

  showSalesOrder: boolean = false;
  salesOrders: SalesOrderList[] = [];

  showPicking: boolean = false;
  pickings: GoodsPickingList[] = [];

  showPacking: boolean = false;
  packings: GoodsPackingList[] = [];

  showConsignmentSales: boolean = false;
  consignment_sales: ConsignmentSalesList[] = [];

  showStockCount: boolean = false;
  showInventoryLevel: boolean = false;

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private quotationService: QuotationService,
    private salesOrderService: SalesOrderService,
    private pickingService: PickingService,
    private packingService: PackingService,
    private consignmentSalesService: ConsignmentSalesService,
    private loadingController: LoadingController,
    private commonService: CommonService,
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === pageCode);
      if (pageItems) {
        this.showQuotation = pageItems.findIndex(r => r.title === mobileQuotationCode) > -1;
        this.showSalesOrder = pageItems.findIndex(r => r.title === mobileSalesOrderCode) > -1;
        this.showPicking = pageItems.findIndex(r => r.title === mobilePickingCode) > -1;
        this.showPacking = pageItems.findIndex(r => r.title === mobilePackingCode) > -1;
        this.showConsignmentSales = pageItems.findIndex(r => r.title === mobileConsignmentSalesCode) > -1;
        this.showStockCount = pageItems.findIndex(r => r.title === mobileInventoryCountCode) > -1;
        this.showInventoryLevel = pageItems.findIndex(r => r.title === mobileInventoryLevelCode) > -1;
      }
    })
    // this.loadAllRecentList();
  }

  loadAllRecentList() {
    // quotation
    if (this.showQuotation) {
      this.loadRecentQuotation();
    }

    // sales order
    if (this.showSalesOrder) {
      this.loadRecentSalesOrder();
    }

    // picking
    if (this.showPicking) {
      this.loadRecentPicking();
    }

    // packing
    if (this.showPacking) {
      this.loadRecentPacking();
    }

    // consignment-sales
    if (this.showConsignmentSales) {
      this.loadRecentConsignmentSales();
    }
  }

  /* #region  quotation */

  loadRecentQuotation() {
    try {
      this.quotationService.getObjectList().subscribe(response => {
        this.quotations = response.slice(0, 3);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading quotation', '', 'top', 'danger', 1000);
    }
  }

  async goToQuotationDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/quotation/quotation-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  sales order */

  loadRecentSalesOrder() {
    try {
      this.salesOrderService.getObjectList().subscribe(response => {
        this.salesOrders = response.slice(0, 3);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading sales order', '', 'top', 'danger', 1000);
    }
  }

  async goToSalesOrderDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId,
      }
    }
    this.navController.navigateForward('/transactions/sales-order/sales-order-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  picking */

  loadRecentPicking() {
    try {
      this.pickingService.getObjectList().subscribe(response => {
        this.pickings = response.slice(0, 3);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading picking', '', 'top', 'danger', 1000);
    }
  }

  async goToPickingDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId,
      }
    }
    this.navController.navigateForward('/transactions/picking/picking-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  packing */

  loadRecentPacking() {
    try {
      this.packingService.getObjectList().subscribe(response => {
        this.packings = response.slice(0, 3);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading packing', '', 'top', 'danger', 1000);
    }
  }

  async goToPackingDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId,
      }
    }
    this.navController.navigateForward('/transactions/packing/packing-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  other-sales */

  loadRecentConsignmentSales() {
    try {
      this.consignmentSalesService.getObjectList().subscribe(response => {
        this.consignment_sales = response.slice(0, 3);
      }, error => {
        console.log(error);
      })
    } catch (error) {
      this.toastService.presentToast('Error loading consignment sales', '', 'top', 'danger', 1000);
    }
  }

  goToConsignmentSalesDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
  }

  /* #endregion */

}
