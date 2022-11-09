import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StockCountDetail, StockCountHeader, StockCountRoot } from 'src/app/modules/others/models/stock-count';
import { StockCountService } from 'src/app/modules/others/services/stock-count.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-stock-count-summary',
  templateUrl: './stock-count-summary.page.html',
  styleUrls: ['./stock-count-summary.page.scss'],
})
export class StockCountSummaryPage implements OnInit {

  stockCountRoot: StockCountRoot;
  stockCountHeader: StockCountHeader;
  stockCountLines: StockCountDetail[] = [];

  constructor(
    private stockCountService: StockCountService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.loadMasterList();
    this.stockCountHeader = this.stockCountService.stockCountHeader;
    this.stockCountLines = this.stockCountService.stockCountLines;
    this.stockCountRoot = {
      header: this.stockCountHeader,
      details: this.stockCountLines,
      barcodeTag: []
    }
  }

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.stockCountService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  done() {
    this.stockCountService.resetVariables();
    this.navController.navigateRoot('/others/stock-count');
  }

}
