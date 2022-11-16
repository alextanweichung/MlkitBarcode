import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { OtherSalesRoot } from '../../../models/other-sales';
import { OtherSalesService } from '../../../services/other-sales.service';

@Component({
  selector: 'app-other-sales-detail',
  templateUrl: './other-sales-detail.page.html',
  styleUrls: ['./other-sales-detail.page.scss'],
})
export class OtherSalesDetailPage implements OnInit {

  otherSalesId: number;
  otherSales: OtherSalesRoot;

  constructor(
    private route: ActivatedRoute,
    private otherSalesService: OtherSalesService,
    private navController: NavController
  ) {
    this.route.queryParams.subscribe(params => {
      this.otherSalesId = params['otherSalesId'];
    })
  }

  ngOnInit() {
    this.loadMasterList();
    if (this.otherSalesId) {
      this.loadObject();
    }
  }

  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.otherSalesService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.salesAgentMasterList = response.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadObject() {
    this.otherSalesService.getOtherSales(this.otherSalesId).subscribe(response => {
      this.otherSales = response;
    }, error => {
      console.log(error);
    })
  }

}
