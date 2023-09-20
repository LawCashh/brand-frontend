export interface Category {
  _id: string;
  title: string;
  imagePath: string | null;
  parent: string | null;
  [key: string]: any;
}
