import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, NavController, ActionSheetController, ViewDidEnter, AlertController, ModalController, IonSearchbar } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentCountService } from '../../services/consignment-count.service';
import { ConsignmentCountHeader, ConsignmentCountRoot } from '../../models/consignment-count';
import { ConfigService } from 'src/app/services/config/config.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';

@Component({
	selector: 'app-consignment-count',
	templateUrl: './consignment-count.page.html',
	styleUrls: ['./consignment-count.page.scss'],
})
export class ConsignmentCountPage implements OnInit, ViewWillEnter, ViewDidEnter {

	@ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;

	objects: ConsignmentCountHeader[] = [];
	uniqueGrouping: Date[] = [];
	currentPage: number = 1;
	itemsPerPage: number = 12;

	constructor(
		public objectService: ConsignmentCountService,
		private authService: AuthService,
		private configService: ConfigService,
		private commonService: CommonService,
		private toastService: ToastService,
		private loadingService: LoadingService,
		private navController: NavController,
		private alertController: AlertController,
		private actionSheetController: ActionSheetController,
		private modalController: ModalController
	) { }

	async ionViewWillEnter(): Promise<void> {
		this.objects = [];
		this.filteredObj = [];
		if ((await Network.getStatus()).connected) {
			try {
				await this.objectService.loadRequiredMaster();
			} catch (error) {
				console.error(error);
				this.toastService.presentToast("", "Not connected to internet", "top", "warning", 1000);
			}
		}
		if (!this.objectService.filterStartDate) {
			this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
		}
		if (!this.objectService.filterEndDate) {
			this.objectService.filterEndDate = this.commonService.getTodayDate();
		}
		this.searchbar.value = null;
		await this.loadLocalObjects();
	}

	async ionViewDidEnter(): Promise<void> {
		// check incomplete trx here
		let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
		if (data) {
			this.promptIncompleteTrxAlert();
		}
	}

	ngOnInit() {

	}

	async promptIncompleteTrxAlert() {
		const alert = await this.alertController.create({
			cssClass: "custom-alert",
			header: "You have uncompleted transaction.",
			subHeader: "Do you want to retrieve or discard",
			backdropDismiss: false,
			buttons: [
				{
					text: "Retrieve",
					cssClass: "success",
					handler: async () => {
						let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
						await this.objectService.setHeader(data.header);
						await this.objectService.setLines(data.details);
						if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
							this.navController.navigateRoot("/transactions/consignment-count/consignment-count-item");
						} else {
							this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");
						}
					}
				},
				{
					text: "Discard",
					role: "cancel",
					cssClass: "cancel",
					handler: async () => {
						await this.configService.removeFromLocalStorage(this.objectService.trxKey);
					}
				}
			]
		});
		await alert.present();
	}

	async loadObjects() {
		try {
			await this.loadingService.showLoading();
			// this.objectService.getObjects().subscribe(async response => {
			this.objectService.getObjects(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
				let objects = response.filter(r => !this.objects.flatMap(rr => rr.consignmentCountId).includes(r.consignmentCountId))
				this.objects = [...this.objects, ...objects];
				await this.resetFilteredObj();
				// let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
				// this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
				// await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
				await this.loadingService.dismissLoading();
				this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
			}, async error => {
				await this.loadingService.dismissLoading();
				console.error(error);
			})
		} catch (e) {
			await this.loadingService.dismissLoading();
			console.error(e);
		} finally {
			await this.loadingService.dismissLoading();
		}
	}

	getObjects(date: Date) {
		// return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
	}

	async loadLocalObjects() {
		try {
			let localObject = await this.configService.getLocalTransaction("ConsignmentCount");
			let d: ConsignmentCountHeader[] = [];
         if (localObject && localObject.length > 0) {
            localObject.forEach(r => {
               let dd: ConsignmentCountRoot = JSON.parse(r.jsonData);
               dd.header.isLocal = true;
               dd.header.guid = r.id;
               dd.header.lastUpdated = r.lastUpdated;
               d.push(dd.header);
            })
            this.objects = [...this.objects, ...d];
         }
			await this.resetFilteredObj();
			if ((await Network.getStatus()).connected) {
				await this.loadObjects();
			}
		} catch (error) {
			console.error(error);
		} finally {

		}
	}

	goToDetail(objectId: number, isLocal: boolean = false, guid: string = null) {
		let navigationExtras: NavigationExtras = {
			queryParams: {
				objectId: objectId,
				isLocal: isLocal,
				guid: guid
			}
		}
		this.navController.navigateForward("/transactions/consignment-count/consignment-count-detail", navigationExtras);
	}

	// Select action
	async selectAction() {
		try {
			const actionSheet = await this.actionSheetController.create({
				header: "Choose an action",
				cssClass: "custom-action-sheet",
				buttons: [
					{
						text: "Add Consignment Count",
						icon: "document-outline",
						handler: () => {
							this.addObject();
						}
					},
					{
						text: "Cancel",
						icon: "close",
						role: "cancel"
					}]
			});
			await actionSheet.present();
		} catch (e) {
			console.error(e);
		}
	}

	addObject() {
      this.objectService.resetVariables();
		this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");
	}

	async filter() {
		try {
			const modal = await this.modalController.create({
				component: FilterPage,
				componentProps: {
					startDate: this.objectService.filterStartDate,
					endDate: this.objectService.filterEndDate,
					customerFilter: false,
					salesAgentFilter: false,
					useDraft: false
				},
				canDismiss: true
			})
			await modal.present();
			let { data } = await modal.onWillDismiss();
			if (data && data !== undefined) {
				this.objects = [];
				this.uniqueGrouping = [];
				this.objectService.filterStartDate = new Date(data.startDate);
				this.objectService.filterEndDate = new Date(data.endDate);
				await this.loadLocalObjects();
			}
		} catch (e) {
			console.error(e);
		}
	}

	async onKeyDown(event, searchText) {
		if (event.keyCode === 13) {
			await this.search(searchText, true);
		}
	}

	itemSearchText: string;
	filteredObj: ConsignmentCountHeader[] = [];
	search(searchText, newSearch: boolean = false) {
		if (newSearch) {
			this.filteredObj = [];
		}
		this.itemSearchText = searchText;
		try {
			if (searchText && searchText.trim().length > 2) {
				if (Capacitor.getPlatform() !== "web") {
					Keyboard.hide();
				}
				this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r => r.consignmentCountNum?.toUpperCase().includes(searchText.toUpperCase()))));
				this.filteredObj.sort((x, y) => {
					if (x.isLocal === y.isLocal) {
						return x.trxDate < y.trxDate ? 0 : 1;
					} else {
						return (x.isLocal === y.isLocal) ? 0 : x.isLocal ? -1 : 1;
					}
				});
				this.currentPage = 1;
			} else {
				this.resetFilteredObj();
				this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
			}
		} catch (e) {
			console.error(e);
		}
	}

	resetFilteredObj() {
		this.filteredObj = JSON.parse(JSON.stringify(this.objects));
		this.filteredObj.sort((x, y) => {
			if (x.isLocal === y.isLocal) {
				return x.trxDate < y.trxDate ? 0 : 1;
			} else {
				return (x.isLocal === y.isLocal) ? 0 : x.isLocal ? -1 : 1;
			}
		});
	}

	highlight(event) {
		event.getInputElement().then(r => {
			r.select();
		})
	}

}
