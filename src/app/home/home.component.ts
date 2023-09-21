import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataService } from '../data.service';
import { Category } from '../models/category.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  loadingMainKategorije: boolean = true;
  loadingDiscountedKategorije: boolean = true;
  mainKategorije: Category[] = [];
  subKategorije: Category[] = [];
  discountedKategorije: Category[] = [];
  selectedMainCategory: Category = {
    _id: '',
    title: '',
    imagePath: null,
    parent: null,
  };
  previousCarouselIndex = 0;
  selectedCarouselIndex = 0;
  carouselLength = 0;
  @ViewChild('slidertop', { static: true }) sliderTop: ElementRef | undefined;
  @ViewChild('sliderbottom', { static: true }) sliderBottom:
    | ElementRef
    | undefined;
  timerSubscription = new Subscription();

  constructor(private http: DataService) {}

  ngOnInit() {
    this.loadKategorije();
    this.automaticSliding();
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
  }

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
