import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
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
    private authService: AuthService,
    private consignmentSalesService: ConsignmentSalesService,
    private navController: NavController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ngOnInit() {
    this.loadModuleControl();
    this.loadMasterList();
    if (this.objectId) {
      this.loadObject();
    }
  }
  
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;
  loadModuleControl() {    
    this.authService.precisionList$.subscribe(precision => {
      this.precisionSales = precision.find(x => x.precisionCode == "SALES");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      this.maxPrecision = this.precisionSales.localMax;
      this.maxPrecisionTax = this.precisionTax.localMax;
    })
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
      console.log("🚀 ~ file: consignment-sales-detail.page.ts:55 ~ ConsignmentSalesDetailPage ~ this.consignmentSalesService.getObjectById ~ this.object", this.object)
    }, error => {
      console.log(error);
    })
  }

}
