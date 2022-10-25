import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { InventoryLevel, InventoryVariationLevel } from '../../models/check-balance';
import { CheckBalanceService } from '../../services/check-balance.service';

@Component({
  selector: 'app-check-balance',
  templateUrl: './check-balance.page.html',
  styleUrls: ['./check-balance.page.scss'],
})
export class CheckBalancePage implements OnInit {

  itemList: ItemList[] = [];
  itemInfo: ItemList;

  itemCode: string = '';
  selectedViewOptions: string = 'item';

  inventoryLevel: InventoryLevel[] = [];
  inventoryLevelVariation: InventoryVariationLevel[] = [];

  constructor(
    private checkBalanceService: CheckBalanceService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadItemList();
  }

  loadItemList() {
    this.checkBalanceService.getItemList().subscribe(response => {
      this.itemList = response;
    }, error => {
      console.log(error);
    })
  }

  validateItemCode() {
    if (this.itemCode && this.itemCode.length > 0) {
      let lookUpItem = this.itemList.find(e => e.itemCode.toUpperCase() == this.itemCode.toUpperCase());
      console.log("🚀 ~ file: check-balance.page.ts ~ line 37 ~ CheckBalancePage ~ validateItemCode ~ lookUpItem", lookUpItem)
      if (lookUpItem) {
        this.itemInfo = lookUpItem;
        if (this.itemInfo.variationTypeCode === "0") {
          // this.selectedViewOptions = 'item';
        }
        // this.search();
      } else {
        this.itemCode = null;
        this.itemInfo = null;
        this.toastService.presentToast('Invalid item code.', '', 'top', 'danger', 1500);
      }
    }
  }

  search() {
    if (!this.itemCode) {
      this.toastService.presentToast('Please enter valid item.', '', 'top', 'danger', 1500);
      return;
    }
    let lookUpItem = this.itemList.find(e => e.itemCode.toUpperCase() == this.itemCode.toUpperCase());
    if (lookUpItem) {
      this.itemInfo = lookUpItem;
      if (this.selectedViewOptions === 'item') {
        this.checkBalanceService.getInventoryLevelByItem(this.itemInfo.itemId).subscribe(response => {
          this.inventoryLevel = response;
          this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1500);
          this.computeLocationList();
          this.showEmpty = true;
          this.computeVariationXY();
        }, error => {
          console.log(error);
        })
      } else {
        this.checkBalanceService.getInventoryLevelByVariation(this.itemInfo.itemId).subscribe(response => {
          this.inventoryLevelVariation = response;
          this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1500);
          this.computeLocationList();
          this.showEmpty = true;
          this.computeVariationXY();
        }, error => {
          console.log(error);
        })
      }
    } else {
      this.toastService.presentToast('Invalid Item Code', '', 'top', 'danger', 1500);
    }
  }

  locationMasterList: any[] = [{ label: 'All', value: 'all' }];
  selectedLocation: string = 'all';
  computeLocationList() {
    this.locationMasterList = [{ label: 'All', value: 'all' }];
    this.selectedLocation = 'all';
    if (this.selectedViewOptions === 'item') {
      this.inventoryLevel.forEach(r => {
        this.locationMasterList.push({ label: r.locationDescription, value: r.locationCode });
      })
    } else {
      this.inventoryLevelVariation.forEach(r => {
        this.locationMasterList.push({ label: r.locationDescription, value: r.locationCode });
      })
    }
  }
  
  itemVariationX: any[] = [{ label: 'All', value: 'all' }];
  selectedVariationX: string = 'all';
  itemVariationY: any[] = [{ label: 'All', value: 'all' }];
  selectedVariationY: string = 'all';
  computeVariationXY() {
    this.itemVariationX = [{ label: 'All', value: 'all' }];
    this.selectedVariationX = 'all';
    this.itemVariationY = [{ label: 'All', value: 'all' }];
    this.selectedVariationY = 'all';
    if (this.selectedViewOptions === 'item') {
      // does nothing
    } else {
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
    }
  }

  showEmpty: boolean = true;
  advancedFilter() {
    if (this.selectedViewOptions === 'item') {
      this.checkBalanceService.getInventoryLevelByItem(this.itemInfo.itemId).subscribe(response => {
        this.inventoryLevel = response;
        if (this.selectedLocation !== 'all') {
          this.inventoryLevel = this.inventoryLevel.filter(r => r.locationCode === this.selectedLocation);
        }
        if (!this.showEmpty) {
          this.inventoryLevel = this.inventoryLevel.filter(r => r.qty > 0);
        }
        this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1500);
      }, error => {
        console.log(error);
      })
    }
    else {
      this.checkBalanceService.getInventoryLevelByVariation(this.itemInfo.itemId).subscribe(response => {
        this.inventoryLevelVariation = response;
        // location filter
        if (this.selectedLocation !== 'all') {
          this.inventoryLevelVariation = this.inventoryLevelVariation.filter(r => r.locationCode === this.selectedLocation);
        }
        // show 0 filter
        if (!this.showEmpty) {
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
        if (this.selectedVariationX !== 'all') {
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
                  if (this.selectedVariationY != 'all') {
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
        this.toastService.presentToast('Search result has been populated.', '', 'top', 'success', 1500);
      }, error => {
        console.log(error);
      })
    }
  }

}
