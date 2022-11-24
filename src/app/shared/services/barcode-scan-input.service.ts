import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemBarcodeModel } from '../models/item-barcode';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class BarcodeScanInputService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    @Inject('apiObject') private apiObject: string
  ) {
    this.apiObject = apiObject;
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getItemInfoByBarcode(barcode: string) {
    return this.http.get<ItemBarcodeModel>(this.baseUrl + this.apiObject + "/itemByBarcode/" + barcode);
  }

}
