import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';
import { NavController, ActionSheetController, Platform, AlertController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { CashDeposit } from '../../../models/cash-deposit';
import { CashDepositService } from '../../../services/cash-deposit.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-cash-deposit-edit',
  templateUrl: './cash-deposit-edit.page.html',
  styleUrls: ['./cash-deposit-edit.page.scss'],
})
export class CashDepositEditPage implements OnInit {

  objectId: number;
  objectForm: FormGroup;
  object: CashDeposit;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navController: NavController,
    private toastService: ToastService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    public objectService: CashDepositService,
    private loadingService: LoadingService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private plt: Platform
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      posCashDepositId: 0,
      posCashDepositNum: [null],
      depositBy: [null],
      depositAmount: [0, [Validators.required]],
      depositDateTime: [new Date, [Validators.required]],
      depositFileId: [null],
      depositSlipNum: [null],
      paymentMethodId: [null, [Validators.required]],
      customerId: [null],
      sequence: [0]
    })
  }

  ngOnInit() {
    this.loadModuleControl();
    this.bindCustomerList();
    if (this.objectId) {
      this.loadObject();
    }
  }

  customerSearchDropdownList: SearchDropdownList[] = [];
  bindCustomerList() {
    this.objectService.customers.forEach(r => {
      this.customerSearchDropdownList.push({
        id: r.customerId,
        code: r.customerCode,
        oldCode: r.oldCustomerCode,
        description: r.name
      })
    })
  }

  onCustomerSelected(event) {
    this.objectForm.patchValue({ customerId: event.id });
  }

  onPaymentMethodSelected(event) {
    this.objectForm.patchValue({ paymentMethodId: event.id });
  }

  loadObject() {
    try {
      this.objectService.getObject(this.objectId).subscribe(response => {
        this.object = response;
        this.objectForm.patchValue(this.object);
        this.date_value = this.commonService.convertDateFormat(this.object.depositDateTime);
        this.date = format(this.date_value, 'MMM d, yyyy');
        this.time_value = this.commonService.convertUtcDate(this.object.depositDateTime);
        this.time = format(this.commonService.convertDateFormat(this.object.depositDateTime), 'hh:mm a');
        if (this.object && this.object.depositFileId) {
          this.loadAttachment(this.object.depositFileId);
        }
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      console.error(e);
    }
  }

  imageUrl: SafeUrl;
  loadAttachment(fileId) {
    try {
      this.objectService.downloadFile(fileId).subscribe(blob => {
        let objectURL = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      console.error(e);
    }
  }

  moduleControl: ModuleControl[] = [];
  fileSizeLimit: number = 1 * 1024 * 1024;
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let uploadFileSizeLimit = this.moduleControl.find(x => x.ctrlName === "UploadFileSizeLimit")?.ctrlValue;
        this.fileSizeLimit = Number(uploadFileSizeLimit) * 1024 * 1024;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region  date part */

  date_active: boolean = false;
  time_active: boolean = false;

  date: any;
  time: any;
  date_value: Date;
  time_value: Date;

  // Toggle date
  toggleDate() {
    this.date_active = this.date_active ? false : true;
    this.time_active = false;
  }

  // On date select
  onDateSelect(event: any) {
    let date = new Date(event.detail.value);
    this.date_value = this.commonService.convertUtcDate(date);
    this.date = format(date, 'MMM d, yyyy');
    this.date_active = false;
    this.bindDateTimeToForm();
  }

  // Toggle time
  toggleTime() {
    this.time_active = this.time_active ? false : true;
    this.date_active = false;
  }

  // On time select
  onTimeSelect(event: any) {
    let time = new Date(event.detail.value);
    this.time_value = this.commonService.convertUtcDate(time);
    this.time = format(time, 'hh:mm a');
    this.time_active = false;
    this.bindDateTimeToForm();
  }

  bindDateTimeToForm() {
    this.objectForm.patchValue({ depositDateTime: new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.time_value.getHours(), this.time_value.getMinutes(), this.time_value.getSeconds()) })
  }

  /* #endregion */

  /* #region  attachment */

  async presentAlert() {
    try {
      if (this.object.depositFileId) {
        const alert = await this.alertController.create({
          header: "Upload new attachment?",
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.selectImage();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.selectImage();
      }
    } catch (e) {
      console.error(e);
    }
  }

  images: LocalFile[] = [];
  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt // Camera, Photos or Prompt!
      });
  
      if (image) {
        this.saveImage(image);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Create a new file from a capture image
  async saveImage(photo: Photo) {
    try {
      const base64Data = await this.readAsBase64(photo);
  
      const fileName = new Date().getTime() + '.jpeg';
      const savedFile = await Filesystem.writeFile({
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
      });
  
      // Reload the file list
      // Improve by only loading for the new image and unshifting array!
      this.loadFiles();
    } catch (e) {
      console.error(e);
    }
  }

  async loadFiles() {
    try {
      this.images = [];
  
      await this.loadingService.showLoading();
  
      Filesystem.readdir({
        path: IMAGE_DIR,
        directory: Directory.Data
      })
        .then(
          (result) => {
            this.loadFileData(result.files);
          },
          async (err) => {
            // Folder does not yet exists!
            await Filesystem.mkdir({
              path: IMAGE_DIR,
              directory: Directory.Data
            });
          }
        )
        .then(async (_) => {
          await this.loadingService.dismissLoading();
        });
    } catch (e) {
      console.error(e);
    }
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  fileToDelete: LocalFile[] = [];
  async loadFileData(fileNames: FileInfo[]) {
    try {
      this.fileToDelete = [];
      for (let f of fileNames) {
        const filePath = `${IMAGE_DIR}/${f.name}`;
  
        const readFile = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Data
        });
        if (f.size > this.fileSizeLimit) {
          this.fileToDelete.push({
            name: f.name,
            path: filePath,
            data: `data:image/jpeg;base64,${readFile.data}`
          });
          this.toastService.presentToast('File size too large', '', 'top', 'danger', 1500);
        } else {
          this.images.push({
            name: f.name,
            path: filePath,
            data: `data:image/jpeg;base64,${readFile.data}`
          });
        }
      }
      this.fileToDelete.forEach(e => {
        this.deleteImage(e);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
  private async readAsBase64(photo: Photo) {
    try {
      if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
          path: photo.path
        });
  
        return file.data;
      }
      else {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
  
        return await this.convertBlobToBase64(blob) as string;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async startUpload(file: LocalFile, objectId: number, fileId: number) {
    try {
      const response = await fetch(file.data);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, file.name);
      this.objectService.uploadFile(objectId, fileId, formData).subscribe(response => {
  
      }, error => {
        console.log(error);
      })
      // this.uploadData(formData, objectId, fileId);     
    } catch (e) {
      console.error(e);
    }
  }

  async deleteImage(file: LocalFile) {
    try {
      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: file.path
      });
      this.loadFiles();
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  async removeDir() {
    try {
      await Filesystem.rmdir({
        path: IMAGE_DIR,
        directory: Directory.Data,
        recursive: true
      })
    } catch (e) {
      console.error(e);
    }
  }

  async cancelEdit() {
    try {
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
        this.removeDir();
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectId
          }
        }
        this.navController.navigateRoot('/transactions/cash-deposit/cash-deposit-detail', navigationExtras);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      if (this.objectForm.valid) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.updateObject();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.toastService.presentToast('Error', 'Please fill required fields.', 'top', 'danger', 2000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async updateObject() {
    try {
      let response = await this.objectService.updateObject(this.objectForm.value);
      if (response.status === 204) {
        await this.startUpload(this.images[0], this.object.posCashDepositId, this.object.depositFileId ?? 0);
        this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
        await this.removeDir();
        this.navController.navigateRoot('transactions/cash-deposit');
      }
    } catch (e) {
      console.error(e);
    }
  }

}
