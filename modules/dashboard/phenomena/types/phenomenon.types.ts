// modules/dashboard/phenomena/types/phenomenon.types.ts

export type Category = {
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  topics?: string[];
  emoji?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Phenomenon = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  category?: Category;
};

export type PhenomenonFormData = {
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
};