import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StockCountHeader, StockCountDetail } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-stock-count-summary-edit',
  templateUrl: './stock-count-summary-edit.page.html',
  styleUrls: ['./stock-count-summary-edit.page.scss'],
})
export class StockCountSummaryEditPage implements OnInit {

  stockCountHeader: StockCountHeader;
  stockCountDetail: StockCountDetail[] = [];

  constructor(
    public objectService: StockCountService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.stockCountHeader = this.objectService.stockCountHeader;
    this.stockCountDetail = this.objectService.stockCountLines;
  }

  nextStep() {
    this.navController.navigateRoot("/transactions/stock-count");
  }

}
