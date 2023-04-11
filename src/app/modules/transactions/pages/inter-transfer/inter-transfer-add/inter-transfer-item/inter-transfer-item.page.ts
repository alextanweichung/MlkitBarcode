import { Component, OnInit } from '@angular/core';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { InterTransferHeader } from 'src/app/modules/transactions/models/inter-transfer';
import { InterTransferService } from 'src/app/modules/transactions/services/inter-transfer.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';

@Component({
  selector: 'app-inter-transfer-item',
  templateUrl: './inter-transfer-item.page.html',
  styleUrls: ['./inter-transfer-item.page.scss'],
})
export class InterTransferItemPage implements OnInit, ViewWillEnter {

  objectHeader: InterTransferHeader;
  itemInCart: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];

  constructor(
    private objectService: InterTransferService,
    private navController: NavController
  ) { }

  ionViewWillEnter(): void {
    this.itemInCart = this.objectService.itemInCart;
  }

  ngOnInit() {
    try {
      this.objectHeader = this.objectService.header;
      if (!this.objectHeader || this.objectHeader === undefined || this.objectHeader === null) {
        this.navController.navigateBack('/transactions/inter-transfer/inter-transfer-header');
      }
      this.componentsLoad();
    } catch (e) {
      console.error(e);
    }
  }

  componentsLoad() {
    // this.loadModuleControl();
    this.loadMasterList();
    this.loadFullItemList();
    // this.loadPromotion();
  }

  fullMasterList: MasterList[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.fullMasterList = response;
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  fullItemList: ItemList[] = [];
  loadFullItemList() {
    try {
      this.objectService.getFullItemList().subscribe(response => {
        this.fullItemList = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }
  
  /* #region  toggle show image */

  showImage: boolean = false;
  toggleShowImage() {
    this.showImage = !this.showImage;
  }

  /* #endregion */

  /* #region  steps */

  async nextStep() {
    try {
      // this.objectService.setChoosenItems(this.itemInCart);
      this.navController.navigateForward('/transactions/inter-transfer/inter-transfer-cart');
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    try {
      this.navController.navigateBack('/transactions/sales-order/sales-order-header');
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
