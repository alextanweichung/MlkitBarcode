import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportsService } from '../../services/reports.service';
import { ConsignmentSalesLocation } from 'src/app/modules/transactions/models/consignment-sales';
import { SalesAnalysisObject } from '../../models/sales-analysis';

@Component({
  selector: 'app-sales-analysis',
  templateUrl: './sales-analysis.page.html',
  styleUrls: ['./sales-analysis.page.scss'],
})
export class SalesAnalysisPage implements OnInit, ViewWillEnter {

  type: SearchDropdownList[] = [];
  selectedType: SearchDropdownList = null;
  location: ConsignmentSalesLocation[] = [];
  locationSearchDropDown: SearchDropdownList[] = [];
  selectedLocation: SearchDropdownList = null;

  object: SalesAnalysisObject[] = [];

  constructor(
    private commonService: CommonService,
    private objectService: ReportsService,
    private toastService: ToastService,
    private alertController: AlertController
  ) { 
    this.setFormattedDateString();
  }

  ionViewWillEnter(): void {
    
  }

  ngOnInit() {
    this.loadLocation();
    this.type.push(
      { id: 0, code: "SDI", description: "Sales by Discount Code, Item Code" },
      { id: 1, code: "SDD", description: "Sales by Trx Date, Discount Code" },
      { id: 2, code: "IXY", description: "Sales by Item Code, X Code, Y Code" },
      { id: 3, code: "SMC", description: "Sales by Discount Code" },
    );
  }

  loadLocation() {
    this.location = [];
    this.objectService.getConsignmentLocation().subscribe(response => {
      this.location = response;
      this.location.forEach(r => {
        this.locationSearchDropDown.push({
          id: r.locationId,
          code: r.locationCode,
          description: r.locationDescription
        })
      })
    }, error => {
      console.error(error);
    })
  }

  objects: any[] = [];
  loadReport() {
    this.object = [];
    this.objectService.getSalesAnalysis({
      reportType : this.selectedType?.id,
      dateStart: new Date(format(new Date(this.startDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
      dateEnd: new Date(format(new Date(this.endDateValue), "yyyy-MM-dd") + "T00:00:00.000Z"),
      locationId: this.selectedLocation.id
    }).subscribe(response => {
      this.object = response;
      this.toastService.presentToast("Search Complete", `${this.object.length} record(s) found.`, "top", "success", 300, true);
    }, error => {
      console.error(error);
    })
  }

  onTypeChanged(event: any) {
    this.object = [];
    this.selectedType = event;
  }

  onLocationChanged(event: any) {
    this.object = [];
    this.selectedLocation = event;
  }

  /* #region calendar handle here */

  formattedStartDateString: string = "";
  startDateValue = format(this.commonService.getFirstDayOfTodayMonth(), "yyyy-MM-dd") + "T08:00:00.000Z";
  maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
  @ViewChild("datetime") datetime: IonDatetime
  setFormattedDateString() {
    this.formattedStartDateString = format(parseISO(format(new Date(this.startDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
    this.formattedEndDateString = format(parseISO(format(new Date(this.endDateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
  }
  
  onStartDateSelected(value: any) {
    this.startDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
    this.setFormattedDateString();
  }

  startDateDismiss() {
    this.datetime.cancel(true);
  }

  startDateSelect() {
    this.datetime.confirm(true);
  }

  formattedEndDateString: string = "";
  endDateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";  
  onEndDateSelected(value: any) {
    this.endDateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
    this.setFormattedDateString();
  }

  endDateDismiss() {
    this.datetime.cancel(true);
  }

  endDateSelect() {
    this.datetime.confirm(true);
  }

  /* #endregion */

}
