import { Component, OnDestroy, OnInit } from '@angular/core';
import { Options } from 'ngx-slider-v2';
import { DataService } from '../data.service';
import { Product } from '../models/product.model';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  value: number = 100;
  options: Options = {
    floor: 0,
    ceil: 200,
  };
  selectedOption: string = 'none';
  selectedPrikazi = 10;
  isLoadingProducts = true;
  products: Product[] = [];
  brojStranica = 0;

  constructor(private http: DataService) {}

  ngOnInit() {
    this.ucitavanjeProducata();
  }

  ucitavanjeProducata() {
    this.isLoadingProducts = true;
    const params = new HttpParams().set('limit', '10');
    this.http
      .getDataWithParams<{
        status: string;
        message: string;
        brojStranica: number;
        data: Product[];
      }>('http://localhost:3000/products', params)
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.brojStranica = res.brojStranica;
          this.isLoadingProducts = false;
        },
        error: (err) => {
          console.log(`Error uzimanja producata ${err}`);
        },
      });
  }

  ngOnDestroy() {}
}
