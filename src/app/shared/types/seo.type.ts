export type SEOData = {
  title: string;
  description: string;
  keywords?: string;
  // Sans URL (page 404), la balise canonique est retirée
  url?: string;
  // Par défaut « index, follow » ; « noindex » pour la page 404
  robots?: string;
};
