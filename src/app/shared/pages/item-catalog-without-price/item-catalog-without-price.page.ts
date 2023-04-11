import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MasterList } from '../../models/master-list';
import { TransactionDetail } from '../../models/transaction-detail';
import { CommonService } from '../../services/common.service';
import { ItemImage } from 'src/app/modules/transactions/models/item';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { format } from 'date-fns';
import { SearchItemService } from '../../services/search-item.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'item-catalog-without-price',
  templateUrl: './item-catalog-without-price.page.html',
  styleUrls: ['./item-catalog-without-price.page.scss'],
})
export class ItemCatalogWithoutPricePage implements OnInit {

  @Input() fullMasterList: MasterList[] = [];
  @Input() showImage: boolean = false;
  
  @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();
  
  constructor(    
    private commonService: CommonService,
    private searchItemService: SearchItemService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
  }
  
  itemSearchText: string;
  availableItems: TransactionDetail[] = [];
  availableImages: ItemImage[] = [];
  searchTextChanged() {
    this.availableItems = [];
    this.availableImages = [];
  }

  searchItem() {
    let searchText = this.itemSearchText;
    this.itemSearchText = '';
    try {
      if (searchText && searchText.trim().length > 2) {
        if (Capacitor.getPlatform() !== 'web') {
          Keyboard.hide();
        }
        this.searchItemService.getItemInfoWithoutPrice(searchText).subscribe(response => {
          this.availableItems = response;
          console.log("🚀 ~ file: item-catalog-without-price.page.ts:49 ~ ItemCatalogWithoutPricePage ~ this.searchItemService.getItemInfoByKeyword ~ this.availableItems:", this.availableItems)
          this.toastService.presentToast('Search Completed', `${this.availableItems.length} item(s) found.`, 'top', 'success', 1000);
        })
        this.loadImages(searchText);
      } else {
        this.toastService.presentToast('Enter at least 3 characters to start searching', '', 'top', 'warning', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  loadImages(searchText) {
    this.searchItemService.getItemImageFile(searchText).subscribe(response => {
      this.availableImages = response;
    }, error => {
      console.log(error);
    })
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.searchItem();
      event.preventDefault();
    }
  }

}
