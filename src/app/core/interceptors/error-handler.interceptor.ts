import { Injectable } from '@angular/core';
import {
   HttpRequest,
   HttpHandler,
   HttpEvent,
   HttpInterceptor,
   HttpContextToken,
   HttpContext
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';

const BACKGROUND_LOAD = new HttpContextToken<boolean>(() => false);

export function background_load() {
   return new HttpContext().set(BACKGROUND_LOAD, true);
}

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

   constructor(
      private router: Router,
      private toastService: ToastService,
      private spinner: NgxSpinnerService
   ) { }
   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      const authToken = 'Bearer ' + JSON.parse(localStorage.getItem('loginUser'))?.token
      const authReq = request.clone({
         headers: request.headers.set('Authorization', authToken)
      });

      //Display spinner after 0.3seconds
      let finished = false;

      //Check Http request context, if background load set to true, do not display spinner
      if (request.context.get(BACKGROUND_LOAD)) {
         finished = true;
      }
      
      setTimeout(async () => {
         if (!finished) {
            this.spinner.show('sp1');
         }
      }, 800);

      return next.handle(authReq).pipe(
         catchError(error => {
            if (error) {
               switch (error.status) {
                  case 400:
                     if (error.error) {
                        const modalStateErrors = [];
                        for (const key in error.error) {
                           if (error.error[key]) {
                              modalStateErrors.push(error.error[key])
                           }
                        }
                        throw modalStateErrors.flat();

                     } else {                        
                        this.toastService.presentToast('Error', 'Bad request error', 'middle', 'danger', 2000);
                        // this.messageService.add({ severity: 'error', summary: 'Bad request error', detail: error.status + ':' + error.statusText });
                     }
                     break;
                  case 401:
                     if (error.error.description) {
                        this.toastService.presentToast('Error', 'Unauthorised', 'middle', 'danger', 2000);
                        // this.messageService.add({ severity: 'error', summary: 'Unauthorised', detail: error.error.description });
                     } else {
                        this.toastService.presentToast('Error', 'Unauthorised', 'middle', 'danger', 2000);
                        // this.messageService.add({ severity: 'error', summary: 'Unauthorised', detail: error.status + ':' + error.statusText });
                     }
                     break;
                  case 404:
                     //this.router.navigateByUrl('/not-found');
                     this.toastService.presentToast('Error', 'No result', 'middle', 'danger', 2000);
                     // this.messageService.add({ severity: 'custom', summary: 'No result', detail: "Resources not found." });
                     break;
                  case 500:
                     //const navigationExtras: NavigationExtras = {state: {error: error.error}}
                     //this.router.navigateByUrl('/error', navigationExtras);
                     this.toastService.presentToast('Error', 'Internal server error 500', 'middle', 'danger', 2000);
                     // this.messageService.add({ severity: 'error', summary: 'Internal server error 500', detail: error.error.message });
                     break;
                  default:
                     this.toastService.presentToast('Error', 'Something went wrong', 'middle', 'danger', 2000);
                     // this.messageService.add({ severity: 'error', summary: 'Something went wrong' });
                     console.log(error);
                     break;
               }
            }
            return throwError(error);
         }),
         //Clear spinner
         finalize(() => {
            finished = true;
            this.spinner.hide('sp1');
         })
      );
   }
}
