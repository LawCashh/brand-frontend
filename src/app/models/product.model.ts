export interface Product {
  _id: string;
  title: string;
  code: string;
  price: number;
  imagePath: string | null;
  numAvailable: number | null;
  parent: string | null;
  brand: string;
  distributer: string;
  category: string;
  discount: number;
  [key: string]: any;
}