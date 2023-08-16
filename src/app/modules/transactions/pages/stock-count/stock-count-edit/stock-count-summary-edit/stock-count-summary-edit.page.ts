import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StockCountHeader, StockCountDetail } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';

@Component({
  selector: 'app-stock-count-summary-edit',
  templateUrl: './stock-count-summary-edit.page.html',
  styleUrls: ['./stock-count-summary-edit.page.scss'],
})
export class StockCountSummaryEditPage implements OnInit {

  objectHeader: StockCountHeader;
  objectDetail: StockCountDetail[] = [];

  constructor(
    public objectService: StockCountService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectHeader = this.objectService.objectHeader;
    this.objectDetail = this.objectService.objectDetail;
  }

  nextStep() {
    this.navController.navigateRoot("/transactions/stock-count");
  }

}
