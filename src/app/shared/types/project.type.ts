import { Stack } from './stack.type';

export type Project = {
  id: string;
  image: string;
  label: string;
  title: string;
  subtitle: string;
  context?: string;
  solution?: string;
  challenge?: string[];
  outils?: Stack[];
  images: string[];
  site?: string;
  github?: string;
};
