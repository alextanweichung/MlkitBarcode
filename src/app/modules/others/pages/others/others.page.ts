import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

const pageCode: string = 'MAOT';
const inventoryLevelCode: string = 'MAOTIL'

@Component({
  selector: 'app-others',
  templateUrl: './others.page.html',
  styleUrls: ['./others.page.scss'],
})
export class OthersPage implements OnInit {

  showInventoryLevel: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === pageCode);
      if (pageItems) {
        this.showInventoryLevel = pageItems.findIndex(r => r.title === inventoryLevelCode) > -1;
      }
    })
  }

}
