import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CashDeposit } from '../../../models/cash-deposit';
import { CashDepositService } from '../../../services/cash-deposit.service';

@Component({
  selector: 'app-cash-deposit-detail',
  templateUrl: './cash-deposit-detail.page.html',
  styleUrls: ['./cash-deposit-detail.page.scss'],
})
export class CashDepositDetailPage implements OnInit {

  objectId: number;
  object: CashDeposit;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    private objectService: CashDepositService,    
    private sanitizer: DomSanitizer
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/cash-deposit');
      }
    })
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/cash-deposit')
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
  }

  paymentMethodMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.paymentMethodMasterList = response.filter(x => x.objectName == 'PaymentMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);      
    }, error => {
      console.log(error);
    })
  }
  
  loadDetail() {
    this.objectService.getObject(this.objectId).subscribe(response => {
      this.object = response;
      if (this.object && this.object.depositFileId) {
        this.loadAttachment(this.object.depositFileId);
      }
    }, error => {
      console.log(error);
    })
  }

  imageUrl: SafeUrl;
  loadAttachment(fileId) {
    this.objectService.downloadFile(fileId).subscribe(blob => {
      let objectURL = URL.createObjectURL(blob);
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    }, error => {
      console.log(error);
    })
  }

  edit() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.objectId
      }
    }
    this.navController.navigateForward('/transactions/cash-deposit/cash-deposit-edit', navigationExtras);
  }

}
