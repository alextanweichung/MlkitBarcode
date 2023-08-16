import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CheckQohRoot } from '../../../models/rp-check-qoh';
import { AuthService } from 'src/app/services/auth/auth.service';

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
    private authService: AuthService,
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
      { prop: 'price', name: 'Price', draggable: false }
    ]
  }

  itemSearchText: string;
  search(searchText, newSearch: boolean = false) {
    if (newSearch) {
      this.objects = [];
      this.realObject = [];
    }
    this.itemSearchText = searchText;
    try {
      if (searchText && searchText.trim().length > 2) {
        if (Capacitor.getPlatform() !== 'web') {
          Keyboard.hide();
        }
        this.objectService.getCheckQoh(searchText, this.loginUser.loginUserType, this.loginUser.salesAgentId).subscribe(response => {
          this.objects = response;
          this.massageData();
          this.toastService.presentToast('Search Complete', `${this.objects.length} item(s) found.`, 'top', 'success', 1000, this.authService.showSearchResult);
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

    this.objects.forEach(r => {
      let price: any[] = [];
      r.segmentPricing.forEach(rr => {
        price.push({
          segmentCode: rr.itemPricing.priceSegmentCode,
          price: rr.itemPricing.unitPrice
        })
      })
      this.realObject.push({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        qoh: r.inventoryLevel.reduce((a, c) => a + (c.qty - c.openQty), 0),
        price: price
      })
    })
  }

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

}
