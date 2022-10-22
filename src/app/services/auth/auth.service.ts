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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string;
  isDebug: string = 'False';
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  // model: MenuItem[];
  // dashboardItem: MenuItem;

  //1 is the size of buffer
  private currentUserSource = new ReplaySubject<LoginUser>(1);
  currentUser$ = this.currentUserSource.asObservable();

  private currentUserTokenSource = new ReplaySubject<CustomToken>(1);
  currentUserToken$ = this.currentUserTokenSource.asObservable();

  //Create menuItemSubject to observe from value of HTTP Get for MenuHierarchy
  // private menuItemSubject = new ReplaySubject<MenuItem[]>(1);
  // menuModel$ = this.menuItemSubject.asObservable();

  constructor(
    private navController: NavController,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    let apiUrl = configService.sys_parameter.apiUrl;
    this.baseUrl = apiUrl;
  }

  // Get user session
  async getSession() {

    // ...
    // put auth session here
    // ...

    // Sample only - remove this after real authentication / session
    let session = {
      email: 'john.doe@mail.com'
    }

    return false;
    // return session;
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
        }
      })
    )
    // Sample only - remove this after real authentication / session
    // let sample_user = {
    //   email: email,
    //   password: password
    // }

    // return sample_user;
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
    // this.buildRestrictColumnsObject(); 
    // this.buildModuleControlObject();   
    // this.buildMasterDefinedGroup();  
  }

  buildMenuModel() {
    this.getMenuHierachy().subscribe(response => {
      // this.model = response;
      // //Manually add dashboard item and move it to the beginning of array
      // this.dashboardItem = { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'], tabindex: "1" };
      // this.model.push(this.dashboardItem);
      // //Only display menu which is not under Mobile Apps Module
      // this.model = this.model.filter(x => x.fragment != "M");
      // this.model = this.model.sort((a, b) => Number(a.tabindex) - Number(b.tabindex));
      // this.setMenuHierarchy(this.model);
    }, error => {
      console.log(error);
    });
  }
  
  getMenuHierachy(){
    return this.http.get<MenuHierarchy[]>(this.baseUrl + 'account/menu').pipe(
      map((response: any) =>       
        response.map((item: any) => item)   
      )
    )
  }

  setMenuHierarchy(item: any){    
    // this.menuItemSubject.next(item);
  }













  // Sign up
  async signUp(email: string, password: string) {

    // Sample only - remove this after real authentication / session
    let sample_user = {
      email: email,
      password: password
    }

    return sample_user;
  }

  // Sign out
  async signOut() {

    // ...
    localStorage.removeItem('loginUser');
    localStorage.removeItem('rpParameters');
    this.currentUserSource.next(null);
    this.currentUserTokenSource.next(null);
    // this.menuItemSubject.next(null);
    this.isLoggedIn = false;
    this.isAdmin = false;
    // ...

    // Navigate to sign-in
    this.navController.navigateRoot('/signin');
  }
}

