// modules/phenomena/types/phenomena.types.ts
export type Phenomenon = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};