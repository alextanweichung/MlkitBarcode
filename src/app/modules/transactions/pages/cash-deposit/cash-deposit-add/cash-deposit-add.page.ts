import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileInfo } from '@capacitor/filesystem/dist/esm/definitions';
import { ActionSheetController, AlertController, NavController, Platform } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
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
  selector: 'app-cash-deposit-add',
  templateUrl: './cash-deposit-add.page.html',
  styleUrls: ['./cash-deposit-add.page.scss'],
})
export class CashDepositAddPage implements OnInit {

  objectForm: FormGroup;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService,
    public objectService: CashDepositService,
    private commonService: CommonService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private plt: Platform
  ) {
    this.date_value = this.commonService.convertUtcDate(this.commonService.getTodayDate());
    this.date = format(this.commonService.getTodayDate(), 'MMM d, yyyy');
    this.time_value = this.commonService.convertUtcDate(this.commonService.getTodayDate());
    this.time = format(this.commonService.getTodayDate(), 'hh:mm a');
    this.newObjectForm();
  }

  ngOnInit() {
    this.removeDir();
    this.loadModuleControl();
    this.bindCustomerList();
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

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      posCashDepositId: 0,
      posCashDepositNum: [null],
      depositBy: [JSON.parse(localStorage.getItem('loginUser'))?.userName],
      depositAmount: [0, [Validators.required]],
      depositDateTime: [new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.time_value.getHours(), this.time_value.getMinutes(), this.time_value.getSeconds()), [Validators.required]],
      depositFileId: [null],
      depositSlipNum: [null],
      paymentMethodId: [null, [Validators.required]],
      customerId: [null],
      sequence: [0]
    })
  }

  onCustomerSelected(event) {
    this.objectForm.patchValue({ customerId: event.id });
  }

  onPaymentMethodSelected(event) {
    this.objectForm.patchValue({ paymentMethodId: event.id });
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

  images: LocalFile[] = [];

  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 50,
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

  async cancelInsert() {
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
        this.navController.navigateBack('/transactions/cash-deposit');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      if (this.objectForm.valid && this.images.length === 1) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.insertObject();
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
        this.toastService.presentToast('Error', 'Please fill required fields & attach 1 file to continue', 'top', 'danger', 2000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async insertObject() {
    try {
      let response = await this.objectService.insertObject(this.objectForm.value);
      if (response.status === 201) {
        let ret = response.body as CashDeposit;
        await this.startUpload(this.images[0], ret.posCashDepositId, ret.depositFileId ?? 0);
        this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
        await this.removeDir();
        this.navController.navigateRoot('transactions/cash-deposit');
      }
    } catch (e) {
      console.error(e);
    }
  }

}
