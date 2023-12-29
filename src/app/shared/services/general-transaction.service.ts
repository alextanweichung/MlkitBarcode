import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MarginResponse, TradingMarginResponse } from '../models/margin-response';

@Injectable({
   providedIn: 'root'
})
export class GeneralTransactionService {

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService,
      @Inject('apiObject') private apiObject: string
   ) { }

   getConsignmentMarginForConsignmentSales(itemId: number, trxDate: string, locationId: number, discountGroupCode: string) {
      return this.http.get<MarginResponse>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/margin/" + itemId + "/" + trxDate + "/" + locationId + "/" + discountGroupCode);
   }

   getTradingMargin(itemId: number, trxDate: string, keyId: number, discountGroupCode: string) {
      return this.http.get<TradingMarginResponse>(this.configService.selected_sys_param.apiUrl + this.apiObject + "/margin/" + itemId + "/" + trxDate + "/" + keyId + "/" + discountGroupCode);
   }

}
