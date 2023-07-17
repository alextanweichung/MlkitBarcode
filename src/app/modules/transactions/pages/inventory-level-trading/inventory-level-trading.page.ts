import { Component, OnInit, ViewChild } from '@angular/core';
import { IonAccordionGroup, IonPopover } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { InventoryLevel, InventoryVariationLevel, ItemPriceBySegment } from '../../models/inventory-level';
import { InventoryLevelService } from '../../services/inventory-level.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-inventory-level',
  templateUrl: './inventory-level-trading.page.html',
  styleUrls: ['./inventory-level-trading.page.scss'],
})
export class InventoryLevelTradingPage implements OnInit {

  @ViewChild('accordionGroup', { static: false }) accordionGroup: IonAccordionGroup;

  itemList: ItemList[] = [];
  itemInfo: ItemList;

  itemCode: string = '';
  selectedViewOptions: string = 'item';

  inventoryLevel: InventoryLevel[] = [];
  inventoryLevelVariation: InventoryVariationLevel[] = [];

  loginUser: any;

  constructor(
    public objectService: InventoryLevelService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.loginUser = JSON.parse(localStorage.getItem('loginUser'));
    // reload all masterlist whenever user enter listing
    this.objectService.loadRequiredMaster();
  }

  ngOnInit() {
    this.loadModuleControl();
    this.loadItemList();
  }

  moduleControl: ModuleControl[] = [];
  inventoryLevelLocationList: string[] = [];
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let inventoryLevelLocationList = this.moduleControl.find(x => x.ctrlName === "InventoryLevelLocationList")?.ctrlValue;
        this.inventoryLevelLocationList = inventoryLevelLocationList === 'ALL' ? [] : inventoryLevelLocationList.split(',');
      })
    } catch (e) {
      console.error(e);
    }
  }

  itemSearchDropdownList: SearchDropdownList[] = [];
  loadItemList() {
    try {
      this.objectService.getItemList().subscribe(response => {
        this.itemList = response;
        this.itemList.forEach(r => {
          this.itemSearchDropdownList.push({
            id: r.itemId,
            code: r.itemCode,
            description: r.description
          })
        })
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  onItemChanged(event) {
    if (event) {
      this.itemCode = event.code;
      this.validateItemCode();
    }
  }

  validateItemCode() {
    try {
      if (this.itemCode && this.itemCode.length > 0) {
        let lookUpItem = this.itemList.find(e => e.itemCode.toUpperCase() == this.itemCode.toUpperCase());
        if (lookUpItem) {
          this.itemInfo = lookUpItem;
          if (this.itemInfo.variationTypeCode === "0") {
            this.selectedViewOptions = 'item';
          }
          this.search();
        } else {
          this.itemCode = null;
          this.itemInfo = null;
          this.toastService.presentToast('Invalid item code.', '', 'top', 'danger', 1000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  search() {
    try {
      if (!this.itemCode) {
        this.toastService.presentToast('Please enter valid item.', '', 'top', 'danger', 1000);
        return;
      }
      let lookUpItem = this.itemList.find(e => e.itemCode.toUpperCase() == this.itemCode.toUpperCase());
      if (lookUpItem) {
        this.itemInfo = lookUpItem;
        // if (this.selectedViewOptions === 'item') {
        this.objectService.getInventoryLevelByItem(this.itemInfo.itemId, this.loginUser.loginUserType, this.loginUser.salesAgentId).subscribe(response => {
          console.log("🚀 ~ file: inventory-level-trading.page.ts:119 ~ InventoryLevelTradingPage ~ this.objectService.getInventoryLevelByItem ~ response:", response)
          this.inventoryLevel = response;
          // this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1000);
          this.computeLocationList();
          this.hideEmpty = false;
          this.computeVariationXY();
        }, error => {
          console.log(error);
        })
        // } else {
        if (lookUpItem.variationTypeCode !== '0')
          this.objectService.getInventoryLevelByVariation(this.itemInfo.itemId, this.loginUser.loginUserType, this.loginUser.salesAgentId).subscribe(response => {
            console.log("🚀 ~ file: inventory-level-trading.page.ts:131 ~ InventoryLevelTradingPage ~ this.objectService.getInventoryLevelByVariation ~ response:", response)
            this.inventoryLevelVariation = response;
            // this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1000);
            this.computeLocationList();
            this.hideEmpty = false;
            this.computeVariationXY();
          }, error => {
            console.log(error);
          })
        // }
      } else {
        this.toastService.presentToast('Invalid Item Code', '', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  locationMasterList: any[] = [{ label: 'All', value: 'all' }];
  selectedLocation: string = 'all';
  computeLocationList() {
    try {
      this.locationMasterList = [{ label: 'All', value: 'all' }];
      this.selectedLocation = 'all';
      if (this.selectedViewOptions === 'item') {
        this.inventoryLevel.forEach(r => {
          if (this.objectService.locationMasterList.filter(rr => rr.attribute11 === "1").findIndex(rr => rr.code.toUpperCase() === r.locationCode) > -1) {
            this.locationMasterList.push({ label: r.locationDescription, value: r.locationCode });
          }
        })
      } else {
        this.inventoryLevelVariation.forEach(r => {
          if (this.objectService.locationMasterList.filter(rr => rr.attribute11 === "1").findIndex(rr => rr.code.toUpperCase() === r.locationCode) > -1) {
            this.locationMasterList.push({ label: r.locationDescription, value: r.locationCode });
          }
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  itemVariationX: any[] = [{ label: 'All', value: 'all' }];
  selectedVariationX: string = 'all';
  itemVariationY: any[] = [{ label: 'All', value: 'all' }];
  selectedVariationY: string = 'all';
  computeVariationXY() {
    try {
      this.itemVariationX = [{ label: 'All', value: 'all' }];
      this.selectedVariationX = 'all';
      this.itemVariationY = [{ label: 'All', value: 'all' }];
      this.selectedVariationY = 'all';
      if (this.inventoryLevelVariation.length > 0) {
        let variationX = this.inventoryLevelVariation[0]?.itemVariationXDescription;
        let variationY = this.inventoryLevelVariation[0]?.itemVariationYDescription;
        if (variationX.length > 0) {
          variationX.forEach(x => {
            if (x !== null) {
              this.itemVariationX.push({ label: x, value: x });
            }
          })
        }
        if (variationY.length > 0) {
          variationY.forEach(y => {
            if (y !== null) {
              this.itemVariationY.push({ label: y, value: y });
            }
          })
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  hideEmpty: boolean = true;
  advancedFilter() {
    try {
      if (this.selectedViewOptions === 'item') {
        this.objectService.getInventoryLevelByItem(this.itemInfo.itemId, this.loginUser.loginUserType, this.loginUser.salesAgentId??0).subscribe(response => {
          this.inventoryLevel = response;
          if (this.selectedLocation !== 'all') {
            this.inventoryLevel = this.inventoryLevel.filter(r => r.locationCode === this.selectedLocation);
          }
          if (this.hideEmpty) {
            this.inventoryLevel = this.inventoryLevel.filter(r => r.qty !== 0);
          }
          // this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1000);
        }, error => {
          console.log(error);
        })
      }
      else {
        this.objectService.getInventoryLevelByVariation(this.itemInfo.itemId, this.loginUser.loginUserType, this.loginUser.salesAgentId??0).subscribe(response => {
          this.inventoryLevelVariation = response;
          // location filter
          if (this.selectedLocation !== 'all') {
            this.inventoryLevelVariation = this.inventoryLevelVariation.filter(r => r.locationCode === this.selectedLocation);
          }
          // show 0 filter
          if (this.hideEmpty) {
            let locationIds = [];
            let temp = this.inventoryLevelVariation;
            for (let index = 0; index < this.inventoryLevelVariation.length; index++) {
              let total = 0;
              this.inventoryLevelVariation[index].variation.variationDetails.forEach(rr => {
                rr.variationDetails.forEach(rrr => {
                  total += rrr.qty
                })
              })
              if (total === 0) {
                locationIds.push(this.inventoryLevelVariation[index].locationId);
              }
            }
            locationIds.forEach(r => {
              temp.splice(temp.findIndex(rr => rr.locationId === r), 1);
            })
            this.inventoryLevelVariation = [...temp];
          }
          // variation x, y filter
          if (this.selectedVariationX !== 'all' || this.selectedVariationY !== 'all') {
            let temp = this.inventoryLevelVariation;
            let itemVariationXIds = [];
            let itemVariationYIds = [];
            for (let r = 0; r < temp.length; r++) {
              let variations = temp[r].variation.variationDetails;
              for (let rr = 0; rr < variations.length; rr++) {
                if (variations[rr].itemVariationXDescription === this.selectedVariationX) {
                  itemVariationXIds.push(variations[rr].itemVariationXId);
                } else {
                  for (let rrr = 0; rrr < variations[rr].variationDetails.length; rrr++) {
                    if (this.selectedVariationY !== 'all') {
                      if (variations[rr].variationDetails[rrr].itemVariationYDescription === this.selectedVariationY) {
                        itemVariationYIds.push(variations[rr].variationDetails[rrr].itemVariationYId);
                      }
                    }
                  }
                }
              }
            }
            temp.forEach(r => {
              let tempVariation = r.variation.variationDetails;
              itemVariationXIds.forEach(r => {
                tempVariation = tempVariation.filter(rr => rr.itemVariationXId === r);
              })
              r.variation.variationDetails = [...tempVariation];
            })
            temp.forEach(r => {
              let tempVariation = r.variation.variationDetails;
              itemVariationYIds.forEach(r => {
                tempVariation.forEach(rr => {
                  rr.variationDetails = rr.variationDetails.filter(rrr => rrr.itemVariationYId === r);
                })
              })
              r.variation.variationDetails = [...tempVariation];
            })
            this.inventoryLevelVariation = [...temp];
          }
          // this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1000);
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #region item price */

  prices: ItemPriceBySegment[] = [];
  getItemPrice(itemId: number) {
    if (itemId) {
      this.prices = [];
      try {
        this.objectService.getSegmentItemPriceBySalesAgent(this.itemInfo.itemId, this.loginUser.loginUserType, this.loginUser.salesAgentId ?? 0).subscribe(response => {
          this.prices = response;
        }, error => {
          throw error;
        })
      } catch (e) {
        console.error(e);
      }
    } else {
      this.toastService.presentToast('Invalid Item', 'Please select Item.', 'top', 'warn', 1000);
    }
  }

  /* #endregion */

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

  priceModal: boolean = false;
  async showPriceDialog() {
    try {
      if (this.itemInfo !== undefined) {
        await this.getItemPrice(this.itemInfo.itemId);
        this.priceModal = true;
      } else {
        this.toastService.presentToast('Invalid Item', 'Please select Item.', 'top', 'warn', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  hidePriceDialog() {
    this.priceModal = false;
  }

}
