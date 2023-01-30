import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, ViewDidEnter } from '@ionic/angular';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CashDeposit } from '../../models/cash-deposit';
import { CashDepositService } from '../../services/cash-deposit.service';

@Component({
  selector: 'app-cash-deposit',
  templateUrl: './cash-deposit.page.html',
  styleUrls: ['./cash-deposit.page.scss'],
})
export class CashDepositPage implements OnInit, ViewDidEnter {

  objects: CashDeposit[] = [];

  constructor(
    private objectService: CashDepositService,
    private actionSheetController: ActionSheetController,
    private navController: NavController
  ) { }

  ionViewDidEnter(): void {
    this.loadObjects();
  }
  
  ngOnInit() {
    this.loadMasterList();
  }

  loadObjects() {
    this.objectService.getObjects().subscribe(response => {
      this.objects = response;
    }, error => {
      console.log(error);
    })
  }
  
  paymentMethodMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.paymentMethodMasterList = response.filter(x => x.objectName == 'PaymentMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  /* #region  add object */

  async addObject() {    
    this.navController.navigateForward('/transactions/cash-deposit/cash-deposit-add');
  }

  // Select action
  async selectAction() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add Cash Deposit',
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

  /* #endregion */

}
