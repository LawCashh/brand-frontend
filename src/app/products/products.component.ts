import { Component, OnDestroy, OnInit } from '@angular/core';
import { Options } from 'ngx-slider-v2';
import { DataService } from '../data.service';
import { Product } from '../models/product.model';
import { HttpParams } from '@angular/common/http';

interface Checkbox {
  name: string;
  isChecked: boolean;
}

interface Param {
  filter: string;
  value: string | number;
}

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
  brojStranica = 1;
  trenutnaStranica = 1;
  //hardcode-ovano ali da imam tabelu brandovi ne bi bilo
  brands: Checkbox[] = [
    { name: 'A.S.C - HEMIK', isChecked: false },
    { name: 'Agro - Trend STR', isChecked: false },
    { name: 'Agromarket', isChecked: false },
    { name: 'Actiwa', isChecked: false },
    { name: 'AI. I. SR', isChecked: false },
  ];
  selectedBrands: string[] = [];
  distributers: Checkbox[] = [
    { name: 'Metalac', isChecked: false },
    { name: 'Andjelic plast D.O.O', isChecked: false },
    { name: 'Plastic D.O.O', isChecked: false },
    { name: 'Modern Trade', isChecked: false },
    { name: 'TDC', isChecked: false },
  ];
  selectedDistributers: string[] = [];
  params = new HttpParams().set('limit', this.selectedPrikazi);
  searchString: string = '';
  emptyQuery = false;

  constructor(private http: DataService) {}

  ngOnInit() {
    setTimeout(() => {
      this.ucitavanjeProducata();
    }, 1000);
    // this.ucitavanjeProducata();
  }

  ucitavanjeProducata() {
    this.isLoadingProducts = true;
    this.emptyQuery = false;
    this.http
      .getDataWithParams<{
        status: string;
        message: string;
        brojStranica: number;
        trenutnaStranica: number;
        data: Product[];
      }>('http://localhost:3000/products', this.params)
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.brojStranica = res.brojStranica;
          this.trenutnaStranica = res.trenutnaStranica;
          this.isLoadingProducts = false;
          if (this.products.length == 0) this.emptyQuery = true;
        },
        error: (err) => {
          console.log(`Error uzimanja producata ${err}`);
        },
      });
  }

  changeChecked(name: string, type: string) {
    this.params = this.params.delete('page');
    if (type == 'brand') {
      this.brands.filter((checkbox) => {
        if (checkbox.name == name) {
          checkbox.isChecked = !checkbox.isChecked;
          if (checkbox.isChecked == true) {
            this.selectedBrands.push(checkbox.name);
          } else {
            this.selectedBrands.splice(
              this.selectedBrands.indexOf(checkbox.name),
              1,
            );
          }
        }
      });
      this.params = this.params
        .delete('brand')
        .set('brand', this.selectedBrands.join(','));
    } else if (type == 'distributer') {
      this.distributers.filter((checkbox) => {
        if (checkbox.name == name) {
          checkbox.isChecked = !checkbox.isChecked;
          if (checkbox.isChecked == true) {
            this.selectedDistributers.push(checkbox.name);
          } else {
            this.selectedDistributers.splice(
              this.selectedDistributers.indexOf(checkbox.name),
              1,
            );
          }
        }
      });
      this.params = this.params
        .delete('distributer')
        .set('distributer', this.selectedDistributers.join(','));
    }
    this.ucitavanjeProducata();
  }

  changeSearch() {
    this.params = this.params.delete('page');
    this.params = this.params.delete('search').set('search', this.searchString);
    this.ucitavanjeProducata();
  }
  changePrikazi() {
    this.params = this.params.delete('page');
    this.params = this.params
      .delete('limit')
      .set('limit', this.selectedPrikazi);
    this.ucitavanjeProducata();
  }

  goBack() {
    this.params = this.params
      .delete('page')
      .set('page', this.trenutnaStranica - 1);
    this.ucitavanjeProducata();
  }
  goForward() {
    this.params = this.params
      .delete('page')
      .set('page', this.trenutnaStranica + 1);
    this.ucitavanjeProducata();
  }

  goToPage(page: number) {
    this.params = this.params.delete('page').set('page', page);
    this.ucitavanjeProducata();
  }

  ngOnDestroy() {}
}
