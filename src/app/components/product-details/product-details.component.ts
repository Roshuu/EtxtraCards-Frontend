import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Routes} from "@angular/router";
import {Product} from "../../common/product";
import {ProductService} from "../../services/product.service";
import {ProductListComponent} from "../product-list/product-list.component";
import {CartService} from "../../services/cart.service";
import {CartItem} from "../../common/cart-item";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product!:Product;

  constructor(private route:ActivatedRoute,
              private productService:ProductService,
              private cartService:CartService) {
  }


  ngOnInit(): void {
    this.HandleProduct();
  }

  HandleProduct(){
    const theProductId: number = +this.route.snapshot.paramMap.get('id')!;

    this.productService.getProduct(theProductId).subscribe(
      data=>{
        this.product=data;
      }
    )
  }


  AddToCart() {
    const theCartItem=new CartItem(this.product);
    this.cartService.addToCart(theCartItem);
  }
}
