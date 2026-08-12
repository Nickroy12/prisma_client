export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  isDeleted?: boolean;
  // Relationships
  orders?: Order[];
  reviews?: Review[];
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isDeleted?: boolean;
  // Relationships
  products?: Product[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: string | null;
  isDeleted?: boolean;
  // Relationships
  category?: Category | null;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  productId: string;
  isDeleted?: boolean;
  // Relationships
  user?: User;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  productId?: string;
  quantity: number;
  isDeleted?: boolean;
  // Relationships
  user?: User;
  product?: Product;
}

