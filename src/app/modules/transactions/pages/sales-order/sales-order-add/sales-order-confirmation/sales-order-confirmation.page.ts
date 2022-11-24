import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-sales-order-confirmation',
  templateUrl: './sales-order-confirmation.page.html',
  styleUrls: ['./sales-order-confirmation.page.scss'],
  providers: [DatePipe]
})
export class SalesOrderConfirmationPage implements OnInit {

  
  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    private salesOrderService: SalesOrderService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {

  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
      if (SystemWideActivateTaxControl != undefined) {
        this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  onItemInCartEditCompleted(event) {
    this.recalculateTotals();
  }

  totalQuantity: number = 0;
  subtotalBeforeTax: number = 0;
  taxAmount: number = 0;
  netTotal: number = 0;
  recalculateTotals() {

  }

  async nextStep() {

  }

  async insertSalesOrder() {
    
  }

  previousStep() {
    // this.salesOrderService.setChoosenItems(this.itemInCart);
    this.navController.navigateBack('/transactions/sales-order/sales-order-item');
  }

}
