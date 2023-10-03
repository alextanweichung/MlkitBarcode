import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StockCountRoot, StockCountHeader, StockCountDetail } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';

@Component({
  selector: 'app-stock-count-summary',
  templateUrl: './stock-count-summary.page.html',
  styleUrls: ['./stock-count-summary.page.scss'],
})
export class StockCountSummaryPage implements OnInit {

  objectRoot: StockCountRoot;
  objectHeader: StockCountHeader;
  objectDetail: StockCountDetail[] = [];

  constructor(
    public objectService: StockCountService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectHeader = this.objectService.objectHeader;
    this.objectDetail = this.objectService.objectDetail;
    this.objectRoot = {
      header: this.objectHeader,
      details: this.objectDetail,
      barcodeTag: []
    }
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/stock-count');
  }

}
