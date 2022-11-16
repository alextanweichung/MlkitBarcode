import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { QuotationList } from '../../models/quotation';
import { CommonService } from '../../../../shared/services/common.service';
import { QuotationService } from '../../services/quotation.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
  providers: [IonRouterOutlet]
})
export class QuotationPage implements OnInit {

  content_loaded: boolean = false;
  objects: QuotationList[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private quotationService: QuotationService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  /* #region  crud */

  loadObjects() {    
    this.quotationService.getQuotationList(this.startDate, this.endDate).subscribe(response => {
      this.objects = response;
      if (this.objects.length > 0) {
        this.content_loaded = true;
      }
      // this.toastService.presentToast('Search Completed.', '', 'bottom', 'success', 1000);
    }, error => {
      console.log((error));
    })
  }

  /* #endregion */

  /* #region  add quotation */

  async addObject() {
    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    if (salesAgentId === 0 || salesAgentId === undefined) {
      this.toastService.presentToast('Error', 'Sales Agent not set', 'bottom', 'danger', 1000);
    } else {
      this.navController.navigateForward('/transactions/quotation/quotation-header');
    }
  }

  /* #endregion */
  
  async filter() {
    const modal = await this.modalController.create({
      component: FilterPage,
      componentProps: {
        startDate: this.startDate,
        endDate: this.endDate
      },
      canDismiss: true
    })

    await modal.present();

    let { data } = await modal.onWillDismiss();

    if (data && data !== undefined) {
      this.startDate = new Date(data.startDate);
      this.endDate = new Date(data.endDate);

      this.loadObjects();
    }
  }

  // Select action
  async selectAction() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add Quotation',
          icon: 'document-outline',
          handler: () => {
            this.addObject();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }]
    });
    await actionSheet.present();
  }

  goToDetail(quotationId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        quotationId: quotationId
      }
    }
    this.navController.navigateForward('/transactions/quotation/quotation-detail', navigationExtras);
  }

}
