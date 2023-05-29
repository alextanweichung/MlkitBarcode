import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { BackToBackOrderRoot } from 'src/app/modules/transactions/models/backtoback-order';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-backtoback-order-detail',
  templateUrl: './backtoback-order-detail.page.html',
  styleUrls: ['./backtoback-order-detail.page.scss'],
})
export class BacktobackOrderDetailPage implements OnInit {

  objectId: number
  object: BackToBackOrderRoot;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: BackToBackOrderService,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
        if (!this.objectId) {
          this.navController.navigateBack('/transactions/sales-order');
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/sales-order')
    } else {
      this.loadModuleControl();
      this.loadObject();
    }
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
    }
  }

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  editObject() {
    this.objectService.setHeader(this.object.header);
    this.objectService.setChoosenItems(this.object.details);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.backToBackOrderId
      }
    }
    this.navController.navigateRoot('/transactions/backtoback-order/backtoback-order-cart', navigationExtras);
  }

  toggleObject() {
    this.objectService.toggleObject(this.object.header.backToBackOrderId).subscribe(response => {
      if (response.status === 204) {
        this.loadObject();
        this.toastService.presentToast("Update Complete", "", "top", "success", 1000);
      }
    }, error => {
      console.error(error);
    })
  }

  matchImage(itemId: number) {
    try {
      let defaultImageUrl = "assets/icon/favicon.png";
      return defaultImageUrl;
    } catch (e) {
      console.error(e);
    }
  }

  filter(details: InnerVariationDetail[]) {
    try {
      return details.filter(r => r.qtyRequest > 0);
    } catch (e) {
      console.error(e);
    }
  }

  /* #region show variaton dialog */

  selectedItem: TransactionDetail;
  showDetails(item: TransactionDetail) {
    if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
      this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
    }
  }
  
  /* #endregion */

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */


}
