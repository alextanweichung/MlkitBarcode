import { Component, OnInit, ViewChild } from '@angular/core';
import { ConsignmentCountService } from '../../../services/consignment-count.service';
import { ConsignmentCountRoot } from '../../../models/consignment-count';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { v4 as uuidv4 } from 'uuid';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { Network } from '@capacitor/network';

@Component({
	selector: 'app-consignment-count-detail',
	templateUrl: './consignment-count-detail.page.html',
	styleUrls: ['./consignment-count-detail.page.scss'],
})
export class ConsignmentCountDetailPage implements OnInit, ViewWillEnter {

	objectId: number;
	isLocal: boolean = false;
	guid: string = null;
	currentPage: number = 1;
	itemsPerPage: number = 12;

	constructor(
		public objectService: ConsignmentCountService,
		private configService: ConfigService,
		private commonService: CommonService,
		private toastService: ToastService,
		private loadingService: LoadingService,
		private route: ActivatedRoute,
		private navController: NavController,
		private alertController: AlertController
	) { }

	async ionViewWillEnter(): Promise<void> {
		if ((await Network.getStatus()).connected) {
			await this.objectService.loadRequiredMaster();
		}
		this.route.queryParams.subscribe(params => {
			this.isLocal = params["isLocal"];
			this.guid = params["guid"];
			if (this.isLocal) {
				if (this.guid) {
					this.loadLocalObject();
				} else {
					this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
				}
			} else {
				this.objectId = params["objectId"];
				if (this.objectId) {
					this.loadObject();
				}
			}
		})
	}

	ngOnInit() {

	}

	async loadObject() {
		try {
			await this.loadingService.showLoading();
			this.objectService.getObjectById(this.objectId).subscribe(async response => {
				let object = response;
				object.header = this.commonService.convertObjectAllDateType(object.header);
				object.details.forEach(r => {
					let found = object.barcodeTag.find(rr => rr.itemSku === r.itemSku);
					if (found) {
						r.itemCode = found.itemCode,
							r.itemDescription = found.description,
							r.itemVariationXDescription = found.itemVariationLineXDescription,
							r.itemVariationYDescription = found.itemVariationLineYDescription,
							r.guid = uuidv4()
					}
				})
				await this.objectService.setHeader(JSON.parse(JSON.stringify(object.header)));
				await this.objectService.setLines(JSON.parse(JSON.stringify(object.details)));
				await this.loadingService.dismissLoading();
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

	async loadLocalObject() {
		try {
			await this.loadingService.showLoading();
			let localObject = await this.configService.getLocalTransactionById("ConsignmentCount", this.guid);
			let object = JSON.parse(localObject.jsonData) as ConsignmentCountRoot;
			object.header.isLocal = true;
			object.header.guid = localObject.id;
			object.header.lastUpdated = localObject.lastUpdated;
			object.details.forEach(r => {
				if (r.itemVariationXId) {
					r.itemVariationXDescription = this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description;
				}
				if (r.itemVariationYId) {
					r.itemVariationYDescription = this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description;
				}
			})
			if (this.isLocal) {
				await this.objectService.setLocalObject(JSON.parse(JSON.stringify(localObject)));
			}
			await this.objectService.setHeader(JSON.parse(JSON.stringify(object.header)));
			await this.objectService.setLines(JSON.parse(JSON.stringify(object.details)));
			await this.loadingService.dismissLoading();
		} catch (e) {
			await this.loadingService.dismissLoading();
			console.error(e);
		} finally {
			await this.loadingService.dismissLoading();
		}
	}

	edit() {
		this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");
	}

	previousStep() {
		this.objectService.resetVariables();
		this.navController.navigateBack("/transactions/consignment-count");
	}

	identify(index, line) {
		return line.guid;
	}

	/* #region more action popover */

	isPopoverOpen: boolean = false;
	@ViewChild("popover", { static: false }) popoverMenu: IonPopover;
	showPopover(event) {
		try {
			this.popoverMenu.event = event;
			this.isPopoverOpen = true;
		} catch (e) {
			console.error(e);
		}
	}

	/* #endregion */

	async deleteLocal() {
		try {
			if (this.objectService.objectHeader.isLocal) {
				const alert = await this.alertController.create({
					cssClass: "custom-alert",
					header: "Delete this Consignment Count?",
					message: "This action cannot be undone.",
					buttons: [
						{
							text: "Delete",
							cssClass: "danger",
							handler: async () => {
								if (this.objectService.localObject) {
									await this.configService.deleteLocalTransaction("ConsignmentCount", this.objectService.localObject);
									this.toastService.presentToast("", "Consignment Count deleted", "top", "success", 1000);
									await this.objectService.resetVariables();
									this.navController.navigateRoot("transactions/consignment-count");
								} else {
									this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
								}
							}
						},
						{
							text: "Cancel",
							role: "cancel",
							cssClass: "cancel",
							handler: async () => {

							}
						}
					]
				});
				await alert.present();
			} else {
				this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
			}
		} catch (e) {
			console.error(e);
		}
	}

}
