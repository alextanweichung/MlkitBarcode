import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

const pageCode: string = 'MAOT';
const otpConfigCode: string = 'MAOTOTP';
const inventoryLevelCode: string = 'MAOTIL'
const inventoryCountCode: string = 'MAOTIC';

@Component({
  selector: 'app-others',
  templateUrl: './others.page.html',
  styleUrls: ['./others.page.scss'],
})
export class OthersPage implements OnInit {

  showOtpConfig: boolean = false;
  showInventoryLevel: boolean = false;
  showStockCount: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === pageCode);
      if (pageItems) {
        this.showOtpConfig = pageItems.findIndex(r => r.title === otpConfigCode) > -1;
        this.showInventoryLevel = pageItems.findIndex(r => r.title === inventoryLevelCode) > -1;
        this.showStockCount = pageItems.findIndex(r => r.title === inventoryCountCode) > -1;
      }
    })
  }

}
