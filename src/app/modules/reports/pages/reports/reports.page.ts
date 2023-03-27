import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  constructor(
    private authService: AuthService,
    private navController: NavController,
  ) { }

  ngOnInit() {
  }

  goToReport(link: string) {
    this.navController.navigateRoot(`/reports/${link}`);
  }

}
