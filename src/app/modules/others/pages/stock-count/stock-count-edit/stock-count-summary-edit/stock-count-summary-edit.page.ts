import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StockCountDetail, StockCountHeader } from 'src/app/modules/others/models/stock-count';
import { StockCountService } from 'src/app/modules/others/services/stock-count.service';
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
    private stockCountService: StockCountService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.loadMasterList();
    this.stockCountHeader = this.stockCountService.stockCountHeader;
    this.stockCountDetail = this.stockCountService.stockCountLines;
  }

  locationMasterList: MasterListDetails[] = [];
  zoneMasterList: MasterListDetails[] = [];
  rackMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.stockCountService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.zoneMasterList = response.filter(x => x.objectName == 'Zone').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.rackMasterList = response.filter(x => x.objectName == 'Rack').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  nextStep() {
    this.navController.navigateRoot("/others/stock-count");
  }

}
