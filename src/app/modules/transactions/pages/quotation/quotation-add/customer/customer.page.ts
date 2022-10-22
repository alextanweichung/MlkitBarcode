import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';

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
    private toastService: ToastService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadCustomerList();
  }  

  customers: Customer[] = [];
  selectedCustomer: Customer;
  searchDropdownList: SearchDropdownList[] = [];
  loadCustomerList() {
    this.quotationService.getCustomerList().subscribe(response => {
      this.customers = response;
      this.customers.forEach(r => {
        this.searchDropdownList.push({
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

  // async showCustomerSearchDropdown() {
  //   let dropdownlist: SearchDropdownList[] = [];
  //   this.customers.forEach(r => {
  //     dropdownlist.push({
  //       id: r.customerId,
  //       code: r.customerCode,
  //       description: r.name
  //     })
  //   })
  //   const modal = await this.modalController.create({
  //     component: SearchDropdownPage,
  //     componentProps: {
  //       searchDropdownList: dropdownlist
  //     },
  //     canDismiss: true
  //   });

  //   await modal.present();

  //   let { data } = await modal.onWillDismiss();

  //   if (data) {
  //     this.selectedCustomer = this.customers.find(r => r.customerId === data.id);
  //   }
  // }

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
