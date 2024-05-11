export type PremiumGeneticsApifyModel = {
  productName: string;
  productPrice: number;
  genetics: string;
  detailsUrl: string;
  outOfStock: boolean;
  pricePerUnit: PremiumGeneticsPricePerUnit[];
};

export interface PremiumGeneticsPricePerUnit {
  unit: number;
  price: number;
}
