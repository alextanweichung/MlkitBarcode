import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CheckQohRoot } from '../../../models/rp-check-qoh';

@Component({
  selector: 'app-rp-check-qoh',
  templateUrl: './rp-check-qoh.page.html',
  styleUrls: ['./rp-check-qoh.page.scss'],
})
export class RpCheckQohPage implements OnInit {

  objects: CheckQohRoot[] = [];
  loginUser: any;
  columns: any;

  constructor(
    private objectService: ReportsService,
    private toastService: ToastService
  ) {
    this.loginUser = JSON.parse(localStorage.getItem('loginUser'));
  }

  ngOnInit() {
    this.columns = [
      { prop: 'itemCode', name: 'Stock Code', draggable: false },
      { prop: 'itemDescription', name: 'Description', draggable: false },
      { prop: 'qoh', name: 'QOH', draggable: false },
      { prop: 'priceSegmentCode', name: 'Price Category', draggable: false },
      { prop: 'nettPrice', name: 'Price', draggable: false },
    ]
  }

  searchText: string = '';
  searchTextChanged() {
    this.objects = [];
  }

  search() {
    let searchText = this.searchText;
    this.searchText = '';
    try {
      if (searchText && searchText.trim().length > 2) {
        if (Capacitor.getPlatform() !== 'web') {
          Keyboard.hide();
        }
        this.objectService.getCheckQoh(searchText, this.loginUser.loginUserType, this.loginUser.salesAgentId).subscribe(response => {
          this.objects = response;
          console.log("🚀 ~ file: rp-check-qoh.page.ts:52 ~ RpCheckQohPage ~ this.objectService.getCheckQoh ~ this.objects:", this.objects)
          this.massageData();
          this.toastService.presentToast('Search Completed', `${this.objects.length} item(s) found.`, 'top', 'success', 1000);
        })
      } else {
        this.toastService.presentToast('Enter at least 3 characters to start searching', '', 'top', 'warning', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  realObject: any[] = [];
  massageData() {
    this.realObject = [];
    this.objects.flatMap(r => r.segmentPricing).forEach(r => {
      this.realObject.push({
        itemCode: this.objects.find(rr => rr.itemId === r.itemPricing.itemId).itemCode,
        itemDescription: this.objects.find(rr => rr.itemId === r.itemPricing.itemId).itemDescription,

        qoh: this.objects.flatMap(rr => rr.inventoryLevel).filter(rr => rr.itemId === r.itemPricing.itemId).reduce((a, c) => a + c.qty, 0),

        priceSegmentCode: r.itemPricing.priceSegmentCode,

        nettPrice: r.itemPricing.unitPrice * (r.itemPricing.discountPercent?((100-r.itemPricing.discountPercent)/100) : 1)
      })
    })
    console.log("🚀 ~ file: rp-check-qoh.page.ts:70 ~ RpCheckQohPage ~ massageData ~ this.realObject:", this.realObject)
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.search();
      event.preventDefault();
    }
  }

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

}
