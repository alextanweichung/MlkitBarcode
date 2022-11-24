import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { QuotationRoot } from '../../../models/quotation';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.page.html',
  styleUrls: ['./quotation-detail.page.scss'],
})
export class QuotationDetailPage implements OnInit {

  objectId: number
  object: QuotationRoot;

  constructor(
    private authService: AuthService,
    private quotationService: QuotationService,
    private route: ActivatedRoute,
    private navController: NavController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/quotation');
      }
    })
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/quotation')
    } else {
      this.loadModuleControl();
      this.loadMasterList();
      this.loadObject();
    }
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    this.authService.precisionList$.subscribe(precision =>{
      this.precisionSales = precision.find(x => x.precisionCode == "SALES");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
    })
  }

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.quotationService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadObject() {
    this.quotationService.getObjectById(this.objectId).subscribe(response => {
      this.object = response;
    }, error => {
      console.log(error);
    })
  }

  matchImage(itemId: number) {
    let defaultImageUrl = "assets/icon/favicon.png";
    // let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
    // if (lookup) {
    //   return "data:image/png;base64, " + lookup;
    // }
    return defaultImageUrl;
  }

  filter(details: InnerVariationDetail[]) {
    return details.filter(r => r.qtyRequest > 0);
  }

}
