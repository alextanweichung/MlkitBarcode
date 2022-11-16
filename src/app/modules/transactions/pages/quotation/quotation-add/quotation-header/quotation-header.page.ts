import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
  selector: 'app-quotation-header',
  templateUrl: './quotation-header.page.html',
  styleUrls: ['./quotation-header.page.scss'],
})
export class QuotationHeaderPage implements OnInit {

  customPopoverOptions: any = {
    message: 'Select one',
    cssClass: 'popover-in-modal'
  };

  constructor(
    private quotationService: QuotationService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService) { }

  ngOnInit() {
    this.loadCustomerList();
  }  

  customers: Customer[] = [];
  selectedCustomer: Customer;
  customerSearchDropdownList: SearchDropdownList[] = [];
  loadCustomerList() {
    this.quotationService.getCustomerList().subscribe(response => {
      this.customers = response;
      this.customers = this.customers.filter(r => r.businessModelType === 'T');
      this.customers.forEach(r => {
        this.customerSearchDropdownList.push({
          id: r.customerId,
          code: r.customerCode,
          description: r.name
        })
      })
    }, error => {
      console.log(error);
    })
  }

  onCustomerSelected(event) {
    if (event && event !== undefined) {
      this.selectedCustomer = this.customers.find(r => r.customerId === event.id);
    }
  }

  async cancelInsert() {    
    const actionSheet = await this.actionSheetController.create({
      header: 'Are you sure to cancel?',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    if (role === 'confirm') {
      this.quotationService.resetVariables();
      this.navController.navigateBack('/transactions/quotation');
    }
  }

  nextStep() {
    if (this.selectedCustomer) {
      this.quotationService.setChoosenCustomer(this.selectedCustomer);
      this.quotationService.removeItems();
      this.navController.navigateForward('/transactions/quotation/quotation-item');
    } else {
      this.toastService.presentToast('Error', 'Please select customer to continue', 'bottom', 'danger', 1000);
    }
  }

}
