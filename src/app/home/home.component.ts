import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { DataService } from '../data.service';
import { Category } from '../models/category.model';
import { interval, Subscription } from 'rxjs';
import { Product } from '../models/product.model';
import { Utility } from '../models/utility.model';
// import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  loadingMainKategorije: boolean = true;
  loadingDiscountedKategorije: boolean = true;
  loadingIzdvajamoKategorije = true;
  loadingRandomSubCategorie1 = true;
  loadingRandomSubCategorie2 = true;
  loadingRandomProducts = true;
  loadingUtilities = true;
  mainKategorije: Category[] = [];
  subKategorije: Category[] = [];
  discountedKategorije: Category[] = [];
  selectedMainCategory: Category = {
    _id: '',
    title: '',
    imagePath: null,
    parent: null,
  };
  selectedIzdvajamoCategory: Category = {
    _id: '',
    title: '',
    imagePath: null,
    parent: null,
  };
  randomSubcategories: Category[] = [];
  //ove pripadaju ovome iznad, one dvije sekcije za 8
  randomProducts1: Product[] = [];
  randomProducts2: Product[] = [];
  //ovo je donja 2x5 sekcija
  randomProducts: Product[] = [];
  utilities: Utility[] = [];

  selectedIzdvajamoSubCategories: Category[] = [];
  previousCarouselIndex = 0;
  selectedCarouselIndex = 0;
  carouselLength = 0;
  @ViewChild('slidertop', { static: true }) sliderTop: ElementRef | undefined;
  @ViewChild('sliderbottom', { static: true }) sliderBottom:
    | ElementRef
    | undefined;
  timerSubscription = new Subscription();
  isSmallScreen: boolean = false;
  selectedUpBar = 'Domacinstvo';

  constructor(private http: DataService) {}

  ngOnInit() {
    if (window.innerWidth <= 576) {
      this.isSmallScreen = true;
    }

    setTimeout(() => {
      this.loadKategorije();
      this.loadUtilities();
      this.automaticSliding();

      this.updateScreenStatus();
    }, 2000);

    // this.loadKategorije();
    // this.loadUtilities();
    // this.automaticSliding();
    //
    // this.updateScreenStatus();
    // this.mediaMatcher
    //   .matchMedia('(max-width: 576px)')
    //   .addListener((mediaQueryListEvent) => {
    //     this.isSmallScreen = mediaQueryListEvent.matches;
    //   });
    // this.isSmallScreen =
    //   this.mediaMatcher.matchMedia('(max-width: 576px)').matches;
  }

  updateScreenStatus() {
    this.isSmallScreen = window.innerWidth <= 576;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateScreenStatus();
  }
  automaticSliding() {
    this.timerSubscription = interval(3000).subscribe({
      next: (res) => {
        this.selectedCarouselIndex =
          (this.selectedCarouselIndex + 1) % this.carouselLength;
        this.goTo(this.selectedCarouselIndex);
      },
      error: (err) => {},
    });
  }
  loadKategorije() {
    this.loadingMainKategorije = true;
    this.loadingIzdvajamoKategorije = true;
    this.loadingRandomSubCategorie1 = true;
    this.loadingRandomSubCategorie2 = true;
    this.loadingRandomProducts = true;
    this.http
      .getData<{ status: string; message: string; data: Category[] }>(
        'http://localhost:3000/categories/parent-categories',
      )
      .subscribe({
        next: (res) => {
          this.mainKategorije = res.data;
          this.loadingMainKategorije = false;
          this.selectedMainCategory = this.mainKategorije[0];
          this.carouselLength = this.mainKategorije.length;
          // Kada bude trebalo da bude dinamicno za izdvajamo panel
          this.selectedIzdvajamoCategory =
            this.mainKategorije[
              Math.floor(Math.random() * this.mainKategorije.length)
            ];
          if (this.selectedIzdvajamoCategory.title == 'Alati')
            this.selectedIzdvajamoCategory = this.mainKategorije[0];
          // this.selectedIzdvajamoCategory = this.mainKategorije[1];
          this.http
            .getData<{
              status: string;
              message: string;
              subCategories: Category[];
            }>(
              `http://localhost:3000/categories/${this.selectedIzdvajamoCategory._id}/subcategories`,
            )
            .subscribe({
              next: (res) => {
                this.selectedIzdvajamoSubCategories = res.subCategories;
                this.randomSubcategories.push(
                  this.selectedIzdvajamoSubCategories[
                    Math.floor(
                      Math.random() *
                        this.selectedIzdvajamoSubCategories.length,
                    )
                  ],
                );
                this.randomSubcategories.push(
                  this.selectedIzdvajamoSubCategories[
                    Math.floor(
                      Math.random() *
                        this.selectedIzdvajamoSubCategories.length,
                    )
                  ],
                );
                this.http
                  .getData<{
                    status: string;
                    message: string;
                    data: Product[];
                  }>(
                    `http://localhost:3000/categories/${this.randomSubcategories[0]._id}/products`,
                  )
                  .subscribe({
                    next: (res) => {
                      this.randomProducts1 = res.data;
                      this.loadingRandomSubCategorie1 = false;
                    },
                    error: (err) => {
                      console.log(`Error uzimanja proizvoda ${err}`);
                    },
                  });
                this.http
                  .getData<{
                    status: string;
                    message: string;
                    data: Product[];
                  }>(
                    `http://localhost:3000/categories/${this.randomSubcategories[1]._id}/products`,
                  )
                  .subscribe({
                    next: (res) => {
                      this.randomProducts2 = res.data;
                      this.loadingRandomSubCategorie2 = false;
                    },
                    error: (err) => {
                      console.log(`Error uzimanja proizvoda ${err}`);
                    },
                  });

                this.loadingIzdvajamoKategorije = false;
              },
              error: (err) => {
                console.log(`Error uzimanja sub kategorija ${err}`);
              },
            });
        },
        error: (err) => {
          console.log(`Error uzimanja main kategorija ${err}`);
        },
      });
    this.loadingDiscountedKategorije = true;
    this.http
      .getData<{ status: string; message: string; data: Category[] }>(
        'http://localhost:3000/categories/three-discounted',
      )
      .subscribe({
        next: (res) => {
          this.discountedKategorije = res.data;
          this.loadingDiscountedKategorije = false;
        },
        error: (err) => {
          console.log(`Error uzimanja discounted kategorija ${err}`);
        },
      });
    this.http
      .getData<{ status: string; message: string; data: Product[] }>(
        'http://localhost:3000/products?limit=10',
      )
      .subscribe({
        next: (res) => {
          this.randomProducts = res.data;
          this.loadingRandomProducts = false;
        },
        error: (err) => {
          console.log(`Error uzimanja random producata ${err}`);
        },
      });
  }

  loadUtilities() {
    this.loadingUtilities = true;
    this.http
      .getData<{ status: string; message: string; data: Utility[] }>(
        'http://localhost:3000/utilities',
      )
      .subscribe({
        next: (res) => {
          this.loadingUtilities = false;
          this.utilities = res.data;
        },
        error: (err) => {
          console.log(`Error uzimanja utilityja ${err}`);
        },
      });
  }

  // getWidth() {
  //   const numItems = this.selectedIzdvajamoSubCategories.length;
  //   return `calc(100% / ${numItems > 5 ? 5 : numItems}px)`;
  // }

  goTo(i: 'left' | 'right' | number) {
    this.timerSubscription.unsubscribe();
    let element1 = null;
    let element2 = null;
    if (this.sliderTop != undefined)
      element1 = this.sliderTop.nativeElement as HTMLDivElement;

    if (this.sliderBottom != undefined)
      element2 = this.sliderBottom.nativeElement as HTMLDivElement;
    if (typeof i == 'number') {
      this.selectedCarouselIndex = i;
      let value = this.selectedCarouselIndex * (100 / this.carouselLength);
      if (element1 != null) element1.style.transform = `translateX(${-value}%)`;
      if (element2 != null) element2.style.transform = `translateX(${-value}%)`;
    } else if (i == 'left' || i == 'right') {
      let value = 0;
      if (i == 'left') {
        value =
          this.previousCarouselIndex * (100 / this.carouselLength) -
          100 / this.carouselLength;
        this.selectedCarouselIndex = this.previousCarouselIndex - 1;
        if (this.selectedCarouselIndex < 0) this.selectedCarouselIndex = 0;
      } else {
        value =
          this.previousCarouselIndex * (100 / this.carouselLength) +
          100 / this.carouselLength;
        this.selectedCarouselIndex = this.previousCarouselIndex + 1;
        if (this.selectedCarouselIndex >= this.carouselLength)
          this.selectedCarouselIndex = this.carouselLength - 1;
      }

      if (value < 0) return;
      if (value >= 100) return;
      else {
        if (element1 != null)
          element1.style.transform = `translateX(${-value}%)`;
        if (element2 != null)
          element2.style.transform = `translateX(${-value}%)`;
      }
    }
    this.previousCarouselIndex = this.selectedCarouselIndex;
    this.automaticSliding();
  }
  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }
}
