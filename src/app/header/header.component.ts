import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Category } from '../models/category.model';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  selectedOption: string = '';
  loadingCategories = true;
  listaKategorija: Category[] = [];
  currPath: '/' | 'XD' | '/products' = 'XD';
  routeSubscription = new Subscription();

  constructor(
    private http: DataService,
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit() {
    this.ucitavanjeKategorija();
    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentPath = this.location.path();
        if (currentPath === '') {
          this.currPath = '/';
        } else if (currentPath === '/products') {
          this.currPath = '/products';
        } else {
          this.currPath = 'XD';
        }
      }
    });
  }

  ucitavanjeKategorija() {
    this.loadingCategories = true;
    this.http
      .getData<{ status: string; message: string; data: Category[] }>(
        'http://localhost:3000/categories',
      )
      .subscribe({
        next: (res) => {
          this.listaKategorija = res.data.filter((category) => {
            return category.parent == null;
          });
          this.selectedOption = 'SveKategorije';
          this.loadingCategories = false;
        },
        error: (err) => {
          console.log('Greska u uzimanju kategorija' + err);
          this.selectedOption = 'Greska';
        },
      });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
