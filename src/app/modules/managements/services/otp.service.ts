import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { User } from 'src/app/shared/models/user';
import { OtpDTO } from '../models/otp';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  baseUrl: string;
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    console.log("🚀 ~ file: otp.service.ts:26 ~ OtpService ~ apiUrl:")
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getOtps() {
    return this.http.get(this.baseUrl + "Otp").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  insertOtp(otp: OtpDTO) {
    return this.http.post(this.baseUrl + "Otp", otp, httpObserveHeader);
  }

  getOtpLines(otpId: number) {
    return this.http.get(this.baseUrl + "Otp/otpLine/" + otpId);
  }

  getOtpHistory(otpLineId: number) {
    return this.http.get(this.baseUrl + "Otp/History/" + otpLineId);
  }

  getDescendantUser() {
    return this.http.get<User[]>(this.baseUrl + "Otp/descendantUser");
  }

  getUserApps(userId: number) {
    return this.http.get(this.baseUrl + "Otp/userApps/" + userId);
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + 'Otp/staticLov').pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getAllApps() {
    return this.http.get(this.baseUrl + "App").pipe(
      map((response: any) =>
        response.data.map((item: any) => item)
      )
    );
  }
}
