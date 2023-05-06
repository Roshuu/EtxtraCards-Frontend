import {Component, OnInit} from '@angular/core';
import {EmailValidator, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ExtraCardFormService} from "../../services/extra-card-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {fetchPackageManifest} from "@angular/cli/src/utilities/package-metadata";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Route, Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {error} from "@angular/compiler-cli/src/transformers/util";

class States {
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit{


   checkoutFormGroup!:FormGroup;
   totalPrice: number=0;
   totalQuantity:number=0;

   creditCardYears:number[]=[];
   creditCardMonths:number[]=[];

   countries:Country[]=[];
   shippingAddressStates:State[]=[];
   billingAddressStates:State[]=[];

  constructor(private formBuilder:FormBuilder,
              private extraCardService:ExtraCardFormService,
              private cartService:CartService,
              private checkoutService: CheckoutService,
              private router:Router) {
  }
  ngOnInit() {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required, Validators.min(2)]),
        lastName: new FormControl('',[Validators.required, Validators.min(2)]),
        email: new FormControl('', Validators.required),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, Validators.min(2)]),
        city: new FormControl('',[Validators.required, Validators.min(2)]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, Validators.min(2)]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, Validators.min(2)]),
        city: new FormControl('',[Validators.required, Validators.min(2)]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, Validators.min(2)]),
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expiratrionMonth: [''],
        expiratrionYear: [''],
      }),
    });

    const startMonth:number=new Date().getMonth()+1;
    this.extraCardService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        this.creditCardMonths=data;
      }
    );

    this.extraCardService.getCreditCardYears().subscribe(
      data=>{
        this.creditCardYears=data;
      }
    );

    this.extraCardService.getCountries().subscribe(
      data=>{
        this.countries=data;
      }
    );

  }

onSubmit(){
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer')!.value);

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity

    const cartItems = this.cartService.cartItems;

    let orderItems: OrderItem[]=[];
    for(let i=0; i<cartItems.length; i++){
      orderItems[i]=new OrderItem(cartItems[i]);
    }

    let purchase = new Purchase();

    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;


    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.shippingAddress.state=billingState.name;
    purchase.shippingAddress.country=billingCountry.name;


    purchase.customer=this.checkoutFormGroup.controls['customer'].value;

    purchase.order=order;
    purchase.orderItems=orderItems;

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next:response=>{
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          this.resetCart();


        },
        error: err=>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );





}

  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}



  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country');}



  copyShippingAddressToBillingAddress(event:any) {
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls["shippingAddress"].value)
      this.billingAddressStates=this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates=[];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expiratrionYear)

    let startMonth: number;
    if(currentYear===selectedYear){
      startMonth=new Date().getMonth()+1;
    }
    else{
      startMonth=1;
    }
    this.extraCardService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        this.creditCardMonths=data;
      }
    );
  }

  getStates(formGroupName:string){

    const formGroup=this.checkoutFormGroup.get(formGroupName);
    const countryCode=formGroup!.value.country.code;
    console.log(`${countryCode}`);
   // const countryName=formGroup!.value.country.name;


    this.extraCardService.getStates(countryCode).subscribe(
      data=>{
        if(formGroupName=='shippingAddress')
            this.shippingAddressStates=data;
        else
          this.billingAddressStates=data;
      });
  }


   reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity=>this.totalQuantity=totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );

  }

  private resetCart() {
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products").then(r => {});
  }
}
