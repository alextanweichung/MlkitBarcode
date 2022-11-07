import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { PackingList } from '../models/packing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class PackingService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { 
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePacking/masterList");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePacking/staticLov");
  }

  getPackingList(startDate: Date, endDate: Date) {
    return this.http.get<PackingList[]>(this.baseUrl + "MobilePacking/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  }

  getRecentPackingList() {
    return this.http.get<PackingList[]>(this.baseUrl + "MobilePacking/recentListing");
  }
  
}
