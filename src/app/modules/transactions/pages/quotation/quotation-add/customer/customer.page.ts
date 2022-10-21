import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  customPopoverOptions: any = {
    message: 'Select one',
    cssClass: 'popover-in-modal'
  };

  constructor(
    private quotationService: QuotationService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadCustomerList();
  }  

  customers: Customer[] = [];
  selectedCustomer: Customer;
  filteredCustomers: Customer[];
  loadCustomerList() {
    this.quotationService.getCustomerList().subscribe(response => {
      this.customers = response;
      this.filteredCustomers = this.customers;
    }, error => {
      console.log(error);
    })
  }

  filterCustomer(event) {
    this.filteredCustomers = this.customers.filter(item => (item.customerCode.toLowerCase().indexOf(event.detail.value.toLowerCase()) !== -1) || (item.name?.toLowerCase().indexOf(event.detail.value.toLowerCase()) !== -1));
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
      this.navController.navigateBack('/quotation');
    }
  }

  nextStep() {
    if (this.selectedCustomer) {
      this.quotationService.setChoosenCustomer(this.selectedCustomer);
      this.quotationService.removeItems();
      this.navController.navigateForward('/quotation/quotation-item');
    } else {
      this.toastService.presentToast('Error', 'Please select customer to continue', 'top', 'danger', 1500);
    }
  }

}
