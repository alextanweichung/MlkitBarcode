import { HttpClient } from '@angular/common/http';
import { Injectable, QueryList } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { File } from '@awesome-cordova-plugins/file';
import { FileOpener } from '@awesome-cordova-plugins/file-opener';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions';
import { ConfigService } from 'src/app/services/config/config.service';
import { TransactionDetail } from '../models/transaction-detail';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AnnouncementFile } from 'src/app/modules/dashboard/models/dashboard';
import { environment } from 'src/environments/environment';
import { UntypedFormGroup } from '@angular/forms';
import { MasterListDetails } from '../models/master-list-details';
import { MasterList } from '../models/master-list';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private loadingService: LoadingService
  ) { }

  /* #region common service */

  getCompanyProfile() {
    try {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "account/companyInfo");
    } catch (e) {
      console.error(e);
    }
  }

  getCompanyProfileByUrl(apiUrl) {
    try {
      return this.http.get(apiUrl + "account/companyInfo").toPromise().then(r => { return r['name'] });
    } catch (e) {
      console.error(e);
    }
  }

  syncInbound() {
    try {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDownload/itemMaster").toPromise();
    } catch (e) {
      console.error(e);
    }
  }

  saveVersion() {
    try {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDownload/mobileVersion/" + environment.version, null)
    } catch (e) {
      console.error(e);
    }
  }

  getAgentsMasterList() {
    try {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDownload/masterlist");
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region date related */

  getFirstDayOfTheYear(): Date {
    try {
      let today = this.getTodayDate();
      let firstDoy = new Date(new Date().getUTCFullYear(), 0, 1, 0, 0, 0);
      firstDoy.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      return firstDoy;
    } catch (e) {
      console.error(e);
    }
  }

  getFirstDayOfTodayMonth(): Date {
    try {
      let today = this.getTodayDate();
      let firstDom = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0);
      firstDom.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      return firstDom;
    } catch (e) {
      console.error(e);
    }
  }

  getTodayDate(): Date {
    try {
      let today = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), new Date().getUTCHours(), new Date().getUTCMinutes(), new Date().getUTCSeconds());
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      return today;
    } catch (e) {
      console.error(e);
    }
  }

  getDateWithoutTimeZone(inputDate: Date): Date {
    let newDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0)
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset())
    return newDate;
  }

  //To add back timezone differences into UTC Date
  convertUtcDate(inputDate: Date): Date {
    try {
      let outputDate = new Date(inputDate);
      outputDate.setMinutes(outputDate.getMinutes() - outputDate.getTimezoneOffset());
      return outputDate;
    } catch (e) {
      console.error(e);
    }
  }

  //To add back timezone differences into UTC Date
  convertDateFormat(inputDate: Date): Date {
    try {
      let outputDate = new Date(inputDate);
      //outputDate.setMinutes(outputDate.getMinutes() - outputDate.getTimezoneOffset());
      return outputDate;
    } catch (e) {
      console.error(e);
    }
  }

  convertDateFormatIgnoreTimeAndDate(inputDate: Date): Date {
    try {
      let outputDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
      return outputDate;
    } catch (e) {
      console.error(e);
    }
  }

  convertDateFormatIgnoreTime(inputDate: Date): Date {
    try {
      let outputDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
      return outputDate;
    } catch (e) {
      console.error(e);
    }
  }

  convertObjectAllDateType(inputObject: any) {
    try {
      if (inputObject.hasOwnProperty('trxDate')) {
        if (inputObject.trxDate != null) {
          inputObject.trxDate = this.convertUtcDate(inputObject.trxDate);
        }
      }
      if (inputObject.hasOwnProperty('trxDateTime')) {
        if (inputObject.trxDateTime != null) {
          inputObject.trxDateTime = this.convertUtcDate(inputObject.trxDateTime);
        }
      }
      if (inputObject.hasOwnProperty('etaDate')) {
        if (inputObject.etaDate != null) {
          inputObject.etaDate = this.convertUtcDate(inputObject.etaDate);
        }
      }
      if (inputObject.hasOwnProperty('cancelDate')) {
        if (inputObject.cancelDate != null) {
          inputObject.cancelDate = this.convertUtcDate(inputObject.cancelDate);
        }
      }
      if (inputObject.hasOwnProperty('startDate')) {
        if (inputObject.startDate != null) {
          inputObject.startDate = this.convertUtcDate(inputObject.startDate);
        }
      }
      if (inputObject.hasOwnProperty('endDate')) {
        if (inputObject.endDate != null) {
          inputObject.endDate = this.convertUtcDate(inputObject.endDate);
        }
      }
      if (inputObject.hasOwnProperty('birthDate')) {
        if (inputObject.birthDate != null) {
          inputObject.birthDate = this.convertUtcDate(inputObject.birthDate);
        }
      }
      if (inputObject.hasOwnProperty('joinDate')) {
        if (inputObject.joinDate != null) {
          inputObject.joinDate = this.convertUtcDate(inputObject.joinDate);
        }
      }
      if (inputObject.hasOwnProperty('effectiveDate')) {
        if (inputObject.effectiveDate != null) {
          inputObject.effectiveDate = this.convertUtcDate(inputObject.effectiveDate);
        }
      }
      if (inputObject.hasOwnProperty('expiryDate')) {
        if (inputObject.expiryDate != null) {
          inputObject.expiryDate = this.convertUtcDate(inputObject.expiryDate);
        }
      }
      if (inputObject.hasOwnProperty('resignDate')) {
        if (inputObject.resignDate != null) {
          inputObject.resignDate = this.convertUtcDate(inputObject.resignDate);
        }
      }
      if (inputObject.hasOwnProperty('postingDate')) {
        if (inputObject.postingDate != null) {
          inputObject.postingDate = this.convertUtcDate(inputObject.postingDate);
        }
      }
      if (inputObject.hasOwnProperty('taxDate')) {
        if (inputObject.taxDate != null) {
          inputObject.taxDate = this.convertUtcDate(inputObject.taxDate);
        }
      }
      if (inputObject.hasOwnProperty('bankStatementDate')) {
        if (inputObject.bankStatementDate != null) {
          inputObject.bankStatementDate = this.convertUtcDate(inputObject.bankStatementDate);
        }
      }
      return inputObject;
    } catch (e) {
      console.error(e);
    }
  }

  convertArrayAllDateType(inputObject: any[]) {
    try {
      if (inputObject.length >= 1) {
        inputObject.forEach(x => {
          if (x.hasOwnProperty('etaDate')) {
            if (x.etaDate != null) {
              x.etaDate = this.convertUtcDate(x.etaDate);
            }
          }
          if (x.hasOwnProperty('lineUDDate')) {
            if (x.lineUDDate != null) {
              x.lineUDDate = this.convertUtcDate(x.lineUDDate)
            }
          }
          if (x.hasOwnProperty('startDate')) {
            if (x.startDate != null) {
              x.startDate = this.convertUtcDate(x.startDate);
            }
          }
          if (x.hasOwnProperty('endDate')) {
            if (x.endDate != null) {
              x.endDate = this.convertUtcDate(x.endDate);
            }
          }
          if (x.hasOwnProperty('gainLossPostDate')) {
            if (x.gainLossPostDate != null) {
              x.gainLossPostDate = this.convertUtcDate(x.gainLossPostDate);
            }
          }
          if (x.hasOwnProperty('knockOffDate')) {
            if (x.knockOffDate != null) {
              x.knockOffDate = this.convertUtcDate(x.knockOffDate);
            }
          }
        })
      }
      return inputObject;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region price related */

  computeUnitPriceExTax(trxLine: any, useTax: boolean, roundingPrecision: number) {
    try {
      if (useTax) {
        trxLine.unitPriceExTax = this.computeAmtExclTax(trxLine.unitPrice, trxLine.taxPct);
      } else {
        trxLine.unitPriceExTax = trxLine.unitPrice;
      }
      trxLine.unitPriceExTax = this.roundToPrecision(trxLine.unitPriceExTax, roundingPrecision);
      return trxLine.unitPriceExTax;
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: any, useTax: boolean, roundingPrecision: number) {
    try {
      if (useTax) {
        trxLine.unitPrice = this.computeAmtInclTax(trxLine.unitPriceExTax, trxLine.taxPct);
      } else {
        trxLine.unitPrice = trxLine.unitPriceExTax;
      }
      trxLine.unitPrice = this.roundToPrecision(trxLine.unitPrice, roundingPrecision);
      return trxLine.unitPrice;
    } catch (e) {
      console.error(e);
    }
  }

  computeAmtInclTax(amount: number, taxPct: number) {
    try {
      let amtInclTax = amount * (1 + (taxPct / 100));
      return amtInclTax;
    } catch (e) {
      console.error(e);
    }
  }

  computeAmtExclTax(amount: number, taxPct: number) {
    try {
      let amtExclTax = amount / (100 + taxPct) * 100;
      return amtExclTax;
    } catch (e) {
      console.error(e);
    }
  }

  roundToPrecision(inputNumber: number, precision: number): number {
    try {
      if (inputNumber) {
        return Number(inputNumber.toFixed(precision));
      } else {
        return null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeDiscTaxAmount(trxLine: any, useTax: boolean, isItemPriceTaxInclusive: boolean, isDisplayTaxInclusive: boolean, roundingPrecision: number) {
    try {
      let totalDiscAmt = 0;
      let unitPrice = trxLine.unitPrice;
      let unitPriceExTax = trxLine.unitPriceExTax;
      let discExpression = trxLine.discountExpression;
      let quantity = trxLine.qtyRequest;
      let subTotal;

      if (isItemPriceTaxInclusive) {
        subTotal = unitPrice * quantity;
      } else {
        subTotal = unitPriceExTax * quantity;
      }

      //To split the expression with multi level discount, for eg. (10%/5%/3%)
      if (discExpression != "" && discExpression != null) {
        let splittedDisc = discExpression.split(/[+/]/g);
        splittedDisc.forEach(x => {
          if (x.includes('%')) {
            let currentdiscPct = parseFloat(x) / 100;
            //let currentDiscAmt = unitPrice * currentdiscPct;    
            let currentDiscAmt = subTotal * currentdiscPct;
            totalDiscAmt = totalDiscAmt + currentDiscAmt;
            // unitPrice = unitPrice - currentDiscAmt;
            subTotal = subTotal - currentDiscAmt;
          } else {
            totalDiscAmt = totalDiscAmt + parseFloat(x);
            //unitPrice = unitPrice - parseFloat(x);
            subTotal = subTotal - parseFloat(x);
          }
        })
      }
      if (useTax) {
        if (isItemPriceTaxInclusive) {
          trxLine.discountAmt = totalDiscAmt;
          trxLine.discountAmtExTax = this.computeAmtExclTax(totalDiscAmt, trxLine.taxPct);
          trxLine.discountAmt = this.roundToPrecision(trxLine.discountAmt, roundingPrecision);
          trxLine.discountAmtExTax = this.roundToPrecision(trxLine.discountAmtExTax, roundingPrecision);
          trxLine.subTotal = (quantity * unitPrice) - totalDiscAmt;
          trxLine.subTotalExTax = (quantity * this.computeAmtExclTax(unitPrice, trxLine.taxPct)) - trxLine.discountAmtExTax;
          trxLine.subTotal = this.roundToPrecision(trxLine.subTotal, roundingPrecision);
          trxLine.subTotalExTax = this.roundToPrecision(trxLine.subTotalExTax, roundingPrecision);
          trxLine.taxAmt = trxLine.subTotal - trxLine.subTotalExTax;
          trxLine.taxAmt = this.roundToPrecision(trxLine.taxAmt, roundingPrecision);
          trxLine.taxInclusive = isDisplayTaxInclusive;
        } else {
          trxLine.discountAmt = this.computeAmtInclTax(totalDiscAmt, trxLine.taxPct);
          trxLine.discountAmtExTax = totalDiscAmt;
          trxLine.discountAmt = this.roundToPrecision(trxLine.discountAmt, roundingPrecision);
          trxLine.discountAmtExTax = this.roundToPrecision(trxLine.discountAmtExTax, roundingPrecision);
          trxLine.subTotalExTax = (quantity * unitPriceExTax) - trxLine.discountAmtExTax;
          trxLine.subTotalExTax = this.roundToPrecision(trxLine.subTotalExTax, roundingPrecision);
          trxLine.taxAmt = trxLine.subTotalExTax * trxLine.taxPct / 100;
          trxLine.taxAmt = this.roundToPrecision(trxLine.taxAmt, roundingPrecision);
          trxLine.taxInclusive = isDisplayTaxInclusive;
          trxLine.subTotal = trxLine.subTotalExTax + trxLine.taxAmt;
          trxLine.subTotal = this.roundToPrecision(trxLine.subTotal, roundingPrecision);
        }
      } else {
        trxLine.discountAmt = totalDiscAmt;
        trxLine.discountAmtExTax = totalDiscAmt;
        trxLine.discountAmt = this.roundToPrecision(trxLine.discountAmt, roundingPrecision);
        trxLine.discountAmtExTax = this.roundToPrecision(trxLine.discountAmtExTax, roundingPrecision);
        trxLine.subTotal = (quantity * unitPrice) - totalDiscAmt;
        trxLine.subTotalExTax = trxLine.subTotal
        trxLine.subTotal = this.roundToPrecision(trxLine.subTotal, roundingPrecision);
        trxLine.subTotalExTax = this.roundToPrecision(trxLine.subTotalExTax, roundingPrecision);
        trxLine.taxAmt = null;
        trxLine.taxInclusive = null;
      }
      //this.trxLine.localTaxAmt = this.trxLine.taxAmt * this.headerObject?.currencyRate;
      return trxLine;
    } catch (e) {
      console.error(e);
    }
  }

  reversePromoImpact(receiptLine: TransactionDetail) {
    try {
      if (receiptLine.promoEventId != null) {
        receiptLine.promoEventId = null;
        receiptLine.isPromoImpactApplied = null;
        receiptLine.discountGroupCode = receiptLine.oriDiscountGroupCode;
        receiptLine.discountExpression = receiptLine.oriDiscountExpression;
      }
      return receiptLine;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region download */

  async commonDownload(file: Blob, object: AnnouncementFile) {
    let mimeType = this.getMimeType(object.filesType);
    try {
      await this.loadingService.showLoading("Downloading");
      if (Capacitor.getPlatform() === 'android') {
        AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
          async result => {
            if (!result.hasPermission) {
              AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                async result => {
                  File.checkFile(File.externalRootDirectory + "/Download", object.filesName + object.filesType).then((isExist) => {
                    File.writeExistingFile(File.externalRootDirectory + "/Download", object.filesName + object.filesType, file).then(async () => {
                      if (mimeType) {
                        FileOpener.open(File.externalRootDirectory + "/Download/" + object.filesName + object.filesType, mimeType);
                      }
                      this.loadingService.dismissLoading();
                    }).catch(async (error) => {
                      this.loadingService.dismissLoading();
                    });
                  }).catch((error) => {
                    File.writeFile(File.externalRootDirectory + "/Download", object.filesName + object.filesType, file, { replace: true }).then(async () => {
                      if (mimeType) {
                        FileOpener.open(File.externalRootDirectory + "/Download/" + object.filesName + object.filesType, mimeType);
                      }
                      this.loadingService.dismissLoading();
                    }).catch(async (error) => {
                      this.loadingService.dismissLoading();
                    });
                  })
                }
              );
            } else {
              File.checkFile(File.externalRootDirectory + "/Download", object.filesName + object.filesType).then((isExist) => {
                File.writeExistingFile(File.externalRootDirectory + "/Download", object.filesName + object.filesType, file).then(async () => {
                  if (mimeType) {
                    await FileOpener.open(File.externalRootDirectory + "/Download/" + object.filesName + object.filesType, mimeType);
                  }
                  this.loadingService.dismissLoading();
                }).catch(async (error) => {
                  this.loadingService.dismissLoading();
                });
              }).catch((error) => {
                File.writeFile(File.externalRootDirectory + "/Download", object.filesName + object.filesType, file, { replace: true }).then(async () => {
                  if (mimeType) {
                    await FileOpener.open(File.externalRootDirectory + "/Download/" + object.filesName + object.filesType, mimeType);
                  }
                  this.loadingService.dismissLoading();
                }).catch(async (error) => {
                  this.loadingService.dismissLoading();
                });
              })
            }
          }
        )
      } else if (Capacitor.getPlatform() === 'ios') {
        File.writeFile(File.tempDirectory, object.filesName + object.filesType, file, { replace: true }).then(async () => {
          if (mimeType) {
            await FileOpener.open(File.tempDirectory + object.filesName + object.filesType, mimeType);
          }
          this.loadingService.dismissLoading();
        }).catch(async (error) => {
          this.loadingService.dismissLoading();
        })
      } else {
        const url = window.URL.createObjectURL(file);
        const link = window.document.createElement("a");
        link.href = url;
        link.setAttribute("download", object.filesName + object.filesType);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        this.loadingService.dismissLoading();
      }
    } catch (e) {
      this.loadingService.dismissLoading();
      console.error(e);
    }
  }

  getMimeType(filesType: string) {
    switch (filesType.toUpperCase()) {
      case ".DOCX":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case ".XLSX":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case ".PPTX":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case ".CSV":
        return "text/csv";
      case ".PDF":
        return "application/pdf";
      case ".PNG":
        return "image/png";
      case ".JPG":
      case ".JPEG":
        return "image/jpeg";
      case ".JSON":
        return "application/json";
      case ".TXT":
        return "text/plain";
      default:
        return null;
    }
  }

  async commonDownloadPdf(file: Blob, filename: string) { // this filename already with extensions
    try {
      filename = filename.replace(" ", "").replace(".pdf", "_" + format(this.getTodayDate(), "yyyyMMdd") + ".pdf");
      await this.loadingService.showLoading("Downloading");
      if (Capacitor.getPlatform() === 'android') {
        File.checkDir(File.externalRootDirectory, "Download").then((results) => {
        }).catch((error) => {
          console.log(JSON.stringify(error));
        })

        let readPermission: boolean = false;
        let writePermission: boolean = false;
        let managePermission: boolean = false;
        await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(async result => {
          if (!result.hasPermission) {
            await AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(result => {
              if (result.hasPermission) {
                writePermission = true;
              }
            }).catch(error => {
              writePermission = false;
            })
          } else {
            writePermission = true;
          }
        })
        await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(async result => {
          if (!result.hasPermission) {
            await AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(result => {
              if (result.hasPermission) {
                readPermission = true;
              }
            }).catch(error => {
              readPermission = false;
            })
          } else {
            readPermission = true;
          }
        })
        await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.MANAGE_EXTERNAL_STORAGE).then(async result => {
          if (!result.hasPermission) {
            await AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.MANAGE_EXTERNAL_STORAGE).then(result => {
              if (result.hasPermission) {
                managePermission = true;
              }
            }).catch(error => {
              managePermission = false;
            })
          } else {
            managePermission = true;
          }
        })

        if (readPermission && writePermission) {
          await File.writeFile(File.externalRootDirectory + "/Download/", filename, file, { replace: true }).then(async () => {
            await FileOpener.open(File.externalRootDirectory + "/Download/" + filename, "application/pdf");
            this.loadingService.dismissLoading();
          }).catch(async (error) => {
            this.loadingService.dismissLoading();
          })
        } else {
          console.log("Permission not allow");
        }
      } else if (Capacitor.getPlatform() === 'ios') {
        await File.writeFile(File.tempDirectory, filename, file, { replace: true }).then(async () => {
          await FileOpener.open(File.tempDirectory + filename, "application/pdf");
          this.loadingService.dismissLoading();
        }).catch(async (error) => {
          this.loadingService.dismissLoading();
        })
      } else {
        const url = window.URL.createObjectURL(file);
        const link = window.document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        this.loadingService.dismissLoading();
      }
    } catch (e) {
      this.loadingService.dismissLoading();
      console.error(e);
    }
  }

  /* #endregion */

  /* #region misc function */

  setInputNumberSelect(viewChildrenQueryList: QueryList<any>, objectType: string) {
    setTimeout(() => {
      const viewChildElement = viewChildrenQueryList.find(element => element.el.nativeElement.id === (objectType))
      if (viewChildElement) {
        viewChildElement.input.nativeElement.select();
      }
    }, 1);
  }

  toFirstCharLowerCase(str: string) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /* #endregion */

  /* #region get latest sales agent */

  lookUpSalesAgent(objectForm: UntypedFormGroup, customerMasterList: MasterListDetails[]) {
    var lookupValue = customerMasterList?.find(e => e.id == objectForm.get('customerId').value);
    if (lookupValue != undefined) {
      if (lookupValue.historyInfo && lookupValue.historyInfo.length > 0) {
        lookupValue.historyInfo.sort(function (a, b) {
          return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
        });
        let salesAgent = lookupValue.historyInfo.find(x => {
          return new Date(objectForm.get('trxDate').value).getTime() >= new Date(x.effectiveDate).getTime()
        })
        if (salesAgent) {
          objectForm.patchValue({ salesAgentId: parseFloat(salesAgent.salesAgentId.toString()) })
        } else {
          objectForm.patchValue({ salesAgentId: parseFloat(lookupValue.attribute1) })
        }
      }
    }
  }

  /* #endregion */

}
