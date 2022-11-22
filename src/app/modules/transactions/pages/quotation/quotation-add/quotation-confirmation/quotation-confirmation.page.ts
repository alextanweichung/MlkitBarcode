import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
// import { QuotationDto, QuotationDtoHeader, QuotationDtoLine, QuotationSummary } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-quotation-confirmation',
  templateUrl: './quotation-confirmation.page.html',
  styleUrls: ['./quotation-confirmation.page.scss'],
  providers: [DatePipe]
})
export class QuotationConfirmationPage implements OnInit {

  // quotationHeader: QuotationDtoHeader;
  itemInCart: Item[];

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    private quotationService: QuotationService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // this.quotationHeader = this.quotationService.quotationHeader;
    this.itemInCart = this.quotationService.itemInCart;
    this.recalculateTotals();
    // if (!this.quotationHeader || this.quotationHeader === undefined) {
    //   this.navController.navigateBack('/transactions/quotation/quotation-header');
    // }
    if (!this.itemInCart || this.itemInCart === undefined || this.itemInCart.length === 0) {
      this.toastService.presentToast('Nothing in cart', 'Please select some Item', 'bottom', 'medium', 1000);
    }
    this.loadModuleControl();
    this.loadMasterList();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
      console.log("🚀 ~ file: quotation-confirmation.page.ts ~ line 53 ~ QuotationConfirmationPage ~ loadModuleControl ~ SystemWideActivateTaxControl", SystemWideActivateTaxControl)
      if (SystemWideActivateTaxControl != undefined) {
        this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  customerMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.quotationService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  onItemInCartEditCompleted(event) {
    console.log("🚀 ~ file: quotation-confirmation.page.ts ~ line 72 ~ QuotationConfirmationPage ~ onItemInCartEditCompleted ~ event", event)
    this.itemInCart = event;
    this.recalculateTotals();
  }

  totalQuantity: number = 0;
  subtotalBeforeTax: number = 0;
  taxAmount: number = 0;
  netTotal: number = 0;
  recalculateTotals() {
    if (this.itemInCart && this.itemInCart.length > 0) {
      this.totalQuantity = this.itemInCart.flatMap(r => r.qtyRequest).reduce((a, c) => Number(a) + Number(c));
      this.subtotalBeforeTax = this.itemInCart.flatMap(r => (r.qtyRequest * r.unitPriceExTax) - r.discountAmtExTax).reduce((a, c) => Number(a) + Number(c));
      this.taxAmount = this.itemInCart.flatMap(r => r.taxAmt).reduce((a, c) => Number(a) + Number(c));
      this.netTotal = this.itemInCart.flatMap(r => (r.qtyRequest * r.unitPrice) - r.discountAmt).reduce((a, c) => Number(a) + Number(c));
    } else {
      this.totalQuantity = null;
      this.subtotalBeforeTax = null;
      this.taxAmount = null;
      this.netTotal = null;
    }
  }

  async nextStep() {
    if (this.itemInCart.length > 0) {
      const alert = await this.alertController.create({
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'OK',
            role: 'confirm',
            handler: async () => {
              await this.insertQuotation();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'bottom', 'danger', 1000);
    }
  }

  async insertQuotation() {
    // let trxLineArray: QuotationDtoLine[] = [];
    // this.itemInCart.forEach(e => {
    //   let objectLine: QuotationDtoLine = {
    //     quotationLineId: 0,
    //     quotationId: 0,
    //     itemId: e.itemId,
    //     itemVariationXId: e.itemVariationLineXId,
    //     itemVariationYId: e.itemVariationLineYId,
    //     itemSku: e.itemSku,
    //     itemCode: e.itemCode,
    //     itemUomId: e.itemUomId,
    //     description: e.description,
    //     extendedDescription: e.description,
    //     qtyRequest: e.qtyRequest,
    //     unitPrice: e.unitPrice,
    //     unitPriceExTax: e.unitPriceExTax,
    //     discountGroupCode: e.discountGroupCode,
    //     discountExpression: e.discountExpression,
    //     discountAmt: e.discountAmt,
    //     discountAmtExTax: e.discountAmtExTax,
    //     taxId: e.taxId,
    //     taxPct: e.taxPct,
    //     taxAmt: e.taxAmt,
    //     taxInclusive: this.quotationHeader.isItemPriceTaxInclusive,
    //     subTotal: e.subTotal,
    //     subTotalExTax: e.subTotalExTax,
    //     sequence: 0,
    //     locationId: this.quotationHeader.locationId,
    //     deactivated: true
    //   }
    //   trxLineArray = [...trxLineArray, objectLine];
    // });
    // let trxDto: QuotationDto = {
    //   header: {
    //     quotationId: 0,
    //     quotationNum: null,
    //     trxDate: new Date(),
    //     businessModelType: this.quotationHeader.businessModelType,
    //     typeCode: (this.quotationHeader.businessModelType === 'T' || this.quotationHeader.businessModelType === 'F') ? 'S' : 'T', // Sales
    //     sourceType: 'M', // Mobile
    //     locationId: this.quotationHeader.locationId,
    //     customerId: this.quotationHeader.customerId,
    //     attention: null,
    //     salesAgentId: JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId,
    //     termPeriodId: this.quotationHeader.termPeriodId,
    //     countryId: this.quotationHeader.countryId,
    //     currencyId: this.quotationHeader.currencyId,
    //     currencyRate: this.quotationHeader.currencyRate,
    //     isHomeCurrency: this.quotationHeader.isHomeCurrency
    //   },
    //   details: trxLineArray,
    // }    
    // this.quotationService.insertQuotation(trxDto).subscribe(response => {
    //   let details: any[] = response.body["details"];
    //   let totalQty: number = 0;
    //   details.forEach(e => {
    //     totalQty += e.qtyRequest;
    //   })

    //   let qs: QuotationSummary = {
    //     quotationNum: response.body["header"]["quotationNum"],
    //     customerName: this.customerMasterList.find(r => r.id === this.quotationHeader.customerId).description,
    //     totalQuantity: totalQty,
    //     totalAmount: response.body["header"]["totalGrossAmt"]
    //   }

    //   this.quotationService.setQuotationSummary(qs);

    //   this.toastService.presentToast('Insert Complete', 'New quotation has been added', 'bottom', 'success', 1000);
    //   this.navController.navigateRoot('/transactions/quotation/quotation-summary');
    // }, error => {
    //   console.log(error);
    // });
  }

  previousStep() {
    this.quotationService.setChoosenItems(this.itemInCart);
    this.navController.navigateBack('/transactions/quotation/quotation-item');
  }

}
