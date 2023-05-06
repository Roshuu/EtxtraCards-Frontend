import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Subject} from "rxjs";
import {compareNumbers} from "@angular/compiler-cli/src/version_helpers";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[]=[];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }


  addToCart(theCartItem: CartItem){
    // check if we already have the item in our cart

     let alreadyExistsInCart: boolean=false;
     let existingCartItem: CartItem=undefined!;


    if (this.cartItems.length > 0) {
      for (let tempCartItem of this.cartItems) {
        if (tempCartItem.id == theCartItem.id) {
          existingCartItem = tempCartItem;
          break;
        }
      }
      //check if we found it
      alreadyExistsInCart=(existingCartItem!=undefined);

    }

    if(alreadyExistsInCart){
      existingCartItem.quantity++;
    }
    else {
      this.cartItems.push(theCartItem);
    }

    this.computerCartTotals();
  }


   computerCartTotals() {
    let totalPriceValue: number=0;
    let totalQuantityValue:number=0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue+=currentCartItem.quantity*currentCartItem.unitPrice;
      totalQuantityValue+=currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

  }


  remove(theCartItem: CartItem){
    const itemIndex=this.cartItems.findIndex(tempCartItem=>tempCartItem.id===theCartItem.id);
    if(itemIndex>-1){
      this.cartItems.splice(itemIndex,1);

      this.computerCartTotals();
    }
  }

}
