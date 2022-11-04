import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { QuotationDto, QuotationLine, QuotationRoot } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  parent: string = 'Quotations'

  quotationId: number;
  quotation: QuotationRoot;
  flattenQuotation: QuotationDto;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService,
    private quotationService: QuotationService
  ) {
    this.route.queryParams.subscribe(params => {
      this.quotationId = params['quotationId'];
      if (params['parent']) {
        this.parent = params['parent'];
      }
    })
  }

  ngOnInit() {
    if (!this.quotationId) {
      this.toastService.presentToast('Something went wrong!', 'Quotation Id not available', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/quotation')
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
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

  loadDetail() {
    this.quotationService.getQuotationDetail(this.quotationId).subscribe(response => {
      this.quotation = response;
      this.flattenQuotation = this.quotationService.flattenDtoDetail(this.quotation);
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

  getFlattenVariations(itemId: number): QuotationLine[] {
    return this.flattenQuotation.details.filter(r => r.itemId === itemId);
  }

}
