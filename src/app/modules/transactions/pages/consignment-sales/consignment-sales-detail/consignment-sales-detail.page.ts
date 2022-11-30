import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ConsignmentSalesRoot } from '../../../models/consignment-sales';
import { ConsignmentSalesService } from '../../../services/consignment-sales.service';

@Component({
  selector: 'app-consignment-sales-detail',
  templateUrl: './consignment-sales-detail.page.html',
  styleUrls: ['./consignment-sales-detail.page.scss'],
})
export class ConsignmentSalesDetailPage implements OnInit {

  objectId: number;
  object: ConsignmentSalesRoot;

  constructor(
    private route: ActivatedRoute,
    private consignmentSalesService: ConsignmentSalesService,
    private navController: NavController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ngOnInit() {
    this.loadMasterList();
    if (this.objectId) {
      this.loadObject();
    }
  }

  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.consignmentSalesService.getMasterList().subscribe(response => {
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
    this.consignmentSalesService.getObjectById(this.objectId).subscribe(response => {
      this.object = response;
    }, error => {
      console.log(error);
    })
  }

}
