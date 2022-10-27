import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  add_card_form: UntypedFormGroup;
  submit_attempt: boolean = false;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {

    // Setup form
    this.add_card_form = this.formBuilder.group({
      card_number: ['', Validators.required],
      expiry_date: ['', Validators.required],
      cvv: ['', Validators.compose([Validators.maxLength(3), Validators.minLength(3), Validators.required])]
    });
  }

  // Format credit
  formatCreditCardNumber(event: any) {

    // Input val
    let value = event.detail.value;

    // Format: 0000 0000 0000 0000
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    // Set formatted value
    if (parts.length > 0) {
      this.add_card_form.get('card_number').setValue(parts.join(' '));
    } else {
      this.add_card_form.get('card_number').setValue(value);
    }
  }

  // Format expiry date
  formatExpiryDate(event: any) {

    // Input val
    let value = event.detail.value;

    // Format: 01/23
    if (value.length == 3) {

      if (!value.includes('/')) {
        const month = value.slice(0, 2);
        const year = value.slice(2, 4);
        this.add_card_form.get('expiry_date').setValue(month + '/' + year);
      }
    } else if (value.length > 5) {
      value = value.substring(0, value.length - 1);
      this.add_card_form.get('expiry_date').setValue(value);
    }
  }

  // Cancel
  cancel() {

    // Dismiss modal
    this.modalController.dismiss();
  }

  // Save card
  async save() {

    this.submit_attempt = true;

    // If form valid
    if (this.add_card_form.valid) {

      // Loading overlay
      const loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: '<p>Saving card...</p><span>Please be patient.</span>',
        spinner: 'crescent'
      });
      await loading.present();

      // Add save logic here ...
      // ...

      // Fake timeout
      setTimeout(() => {

        // Dismiss modal
        this.modalController.dismiss();

        loading.dismiss();
      }, 2000);
    }
  }

}
