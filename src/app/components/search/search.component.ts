import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit{

  constructor(private route: Router ) {
  }

  ngOnInit(): void {
  }

  doSearch(inputValue:string){
    console.log(`value:${inputValue}`)
    this.route.navigateByUrl(`search/${inputValue}`);
  };

}
