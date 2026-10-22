// modules/dashboard/learning-materials/types/learning.types.ts

export type MaterialType = "VIDEO" | "PPT";

export type MaterialStatus = "ALL" | "PUBLISHED" | "DRAFT";

export interface LearningCategory {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
}

export interface LearningPhenomenon {
  id: string;
  title: string;
  slug: string;
  category: LearningCategory;
}

export interface LearningMaterial {
  id: string;
  phenomenonId: string;
  type: MaterialType;
  title: string;
  description: string | null;
  url: string;
  storagePath: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  phenomenon: LearningPhenomenon;
}

export interface LearningMaterialFormData {
  phenomenonId: string;
  type: MaterialType;
  title: string;
  description: string;
  url: string;
  storagePath?: string | null;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface LearningMaterialFilters {
  search: string;
  categoryId: string;
  phenomenonId: string;
  type: MaterialType | "ALL";
  status: MaterialStatus;
}

export interface LearningMaterialPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface LearningMaterialStats {
  total: number;
  video: number;
  ppt: number;
  published: number;
  draft: number;
}

export interface LearningMaterialsResponse {
  materials: LearningMaterial[];
  pagination: LearningMaterialPagination;
  stats: LearningMaterialStats;
}

export interface LearningMaterialDetailResponse {
  material: LearningMaterial;
  message?: string;
}

export interface LearningMaterialMutationResponse {
  message: string;
  material?: LearningMaterial;
}

export interface LearningPhenomenaResponse {
  phenomena: Array<
    Omit<LearningPhenomenon, "category"> & {
      name: string;
      category: LearningCategory;
    }
  >;
}

export interface LearningCategoriesResponse {
  categories: Array<
    LearningCategory & {
      sortOrder: number;
      isPublished: boolean;
    }
  >;
}

export interface LearningMaterialApiError {
  message: string;
}