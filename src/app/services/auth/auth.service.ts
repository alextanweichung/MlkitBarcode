import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode, { JwtHeader, JwtPayload } from "jwt-decode";
import { ConfigService } from '../config/config.service';
import { CustomToken, LoginRequest, LoginUser, TokenRequest } from './login-user';
import { NavController } from '@ionic/angular';
import { MenuHierarchy } from './menu-hierarchy';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { MenuItem, MenuItemRoot } from './menu-item';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { RestrictedColumn } from 'src/app/shared/models/restricted-column';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string;
  isDebug: string = 'False';
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  restrictedColumn: RestrictedColumn[];
  moduleControlConfig: ModuleControl[];
  model: MenuItem[];
  precisionList: PrecisionList[];
  // dashboardItem: MenuItem;

  // 1 is the size of buffer
  private currentUserSource = new ReplaySubject<LoginUser>(1);
  currentUser$ = this.currentUserSource.asObservable();

  private currentUserTokenSource = new ReplaySubject<CustomToken>(1);
  currentUserToken$ = this.currentUserTokenSource.asObservable();

  // Create menuItemSubject to observe from value of HTTP Get for MenuHierarchy
  private menuItemSubject = new ReplaySubject<MenuItemRoot[]>(1);
  menuModel$ = this.menuItemSubject.asObservable();

  //Create restrictedColumnSubject to observe from value of HTTP Get for RestrictedColumn
  private restrictedColumnSubject = new ReplaySubject<any[]>(1);
  restrictedColumn$ = this.restrictedColumnSubject.asObservable();

  // Create moduleControlSubject to observe from value of HTTP Get for frontEndModuleControl
  private moduleControlSubject = new ReplaySubject<ModuleControl[]>(1);
  moduleControlConfig$ = this.moduleControlSubject.asObservable();

  // Create precisionListSubject to observe from value of HTTP Get for Precision Config
  private precisionListSubject = new ReplaySubject<PrecisionList[]>(1);
  precisionList$ = this.precisionListSubject.asObservable();

  constructor(
    private navController: NavController,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    let apiUrl = configService.sys_parameter.apiUrl;
    this.baseUrl = apiUrl;

    if (!this.isTokenExpired()) {
      this.buildAllObjects();
    }
  }

  // Sign in
  async signIn(loginModel: LoginRequest) {
    return this.http.post(this.baseUrl + "account/login", loginModel).pipe(
      map((response: LoginUser) => {
        const loginUser = response;
        if (loginUser.token !== null) {
          localStorage.setItem('loginUser', JSON.stringify(loginUser));
          this.currentUserSource.next(loginUser);
          this.setCurrentUserToken(loginUser.token);
          this.buildAllObjects();
          this.setDebugMode(loginUser.token);
          this.isLoggedIn = true;
          this.checkAdminRights(loginUser.token);
          this.updatePlayerId(loginUser);
        }
      })
    )
  }

  updatePlayerId(loginUser: LoginUser) {
    let user = this.getDecodedToken(loginUser.token);
    if (loginUser.playerId !== localStorage.getItem("player_Id")) {
      this.http.put(this.baseUrl + "user/playerId/" + Number(user.nameid) + "/" + localStorage.getItem("player_Id"), httpObserveHeader).subscribe(response => {
      }, error => {
        console.log(error);
      });
    }
  }

  refreshToken(tokenRequest: TokenRequest) {
    return this.http.post(this.baseUrl + 'account/refreshToken', tokenRequest).pipe(
      map((response: LoginUser) => {
        const loginUser = response;
        if (loginUser.token != null) {
          localStorage.setItem('loginUser', JSON.stringify(loginUser));
          this.currentUserSource.next(loginUser);
          this.setCurrentUserToken(loginUser.token);
          this.isLoggedIn = true;
          this.checkAdminRights(loginUser.token);
        }
      })
    )
  }

  setCurrentUserToken(token: string) {
    let decodedToken = this.getDecodedToken(JSON.stringify(token));
    this.currentUserTokenSource.next(decodedToken);
    this.isLoggedIn = true;
  }

  getDecodedToken(token: string) {
    const decoded = jwt_decode<CustomToken>(token);
    return decoded;
  }

  setDebugMode(token: string) {
    const decoded = jwt_decode<CustomToken>(token);
    //After decode, assign debug mode variable
    this.isDebug = decoded.debug_mode;
  }

  checkAdminRights(token: string) {
    const decoded = jwt_decode<CustomToken>(token);
    if (decoded.role == "Admin") {
      this.isAdmin = true;
    }
  }

  buildAllObjects() {
    this.buildMenuModel();
    this.buildRestrictColumnsObject();
    this.buildModuleControlObject();
    this.buildPrecisionList();
    // this.buildMasterDefinedGroup();  
  }

  buildMenuModel() {
    this.getMenuHierachy().subscribe(response => {
      this.model = response;
      // Manually add dashboard item and move it to the beginning of array
      // this.dashboardItem = { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'], tabindex: "1" };
      // this.model.push(this.dashboardItem);
      // Only display menu which is not under Mobile Apps Module
      this.model = this.model.filter(x => x.fragment === "M");
      this.model = this.model.sort((a, b) => Number(a.tabindex) - Number(b.tabindex));
      this.setMenuHierarchy(this.model);
    }, error => {
      console.log(error);
    });
  }

  buildRestrictColumnsObject() {
    this.getRestrictedColumn().subscribe(response => {
      this.restrictedColumn = response;
      this.setRestrictedColumn(this.restrictedColumn);
    });
  }

  buildModuleControlObject() {
    this.getModuleControl().subscribe(response => {
      this.moduleControlConfig = response;
      this.setModuleControl(this.moduleControlConfig);
    });
  }

  buildPrecisionList() {
    this.getPrecisionList().subscribe(response => {
      this.precisionList = response;
      this.setPrecisionList(this.precisionList);
    });
  }

  getMenuHierachy() {
    return this.http.get<MenuHierarchy[]>(this.baseUrl + 'account/menu').pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    )
  }

  setMenuHierarchy(item: any) {
    this.menuItemSubject.next(item);
  }

  getRestrictedColumn() {
    return this.http.get<RestrictedColumn[]>(this.baseUrl + 'account/restrictedColumns').pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    )
  }

  setRestrictedColumn(item: any) {
    this.restrictedColumnSubject.next(item);
  }

  getModuleControl() {
    return this.http.get<ModuleControl[]>(this.baseUrl + 'account/frontEndModuleControl').pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    )
  }

  getPrecisionList() {
    return this.http.get<PrecisionList[]>(this.baseUrl + 'account/precision');
  }

  setModuleControl(item: any) {
    this.moduleControlSubject.next(item);
  }

  setPrecisionList(item: any) {
    this.precisionListSubject.next(item);
  }

  isTokenExpired(token?: string): boolean {
    if (!token) token = this.getToken();
    if (!token) return true;

    const tokenExpiryDate = this.getTokenExpirationDate(token);
    if (tokenExpiryDate === undefined) return true;
    return !(tokenExpiryDate.valueOf() > new Date().valueOf());
  }

  getToken(): string {
    return JSON.parse(localStorage.getItem('loginUser'))?.token;
  }

  getTokenExpirationDate(token: string): Date {
    const decoded: JwtPayload = jwt_decode(token);
    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  // Sign out
  async signOut() {

    // ...
    localStorage.removeItem('loginUser');
    // localStorage.removeItem('rpParameters');
    this.currentUserSource.next(null);
    this.currentUserTokenSource.next(null);
    this.menuItemSubject.next(null);
    this.precisionListSubject.next(null);
    this.isLoggedIn = false;
    this.isAdmin = false;
    // ...

    // Navigate to sign-in
    this.navController.navigateRoot('/signin');
  }
}

