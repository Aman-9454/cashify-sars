import { ProjectTemplate } from './types';
import { THEMES_REGISTRY } from './themesRegistry';

/**
 * All 15 White-Label Design System Templates
 */
export const AVAILABLE_TEMPLATES: ProjectTemplate[] = THEMES_REGISTRY;

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return AVAILABLE_TEMPLATES.find((t) => t.id === id);
}

export const TEMPLATE_CATEGORIES = [
  'All',
  'Modern Minimal',
  'Marketplace',
  'Dark Tech',
  'Apple Premium',
  'Luxury / Flagship',
  'Material Design',
  'Cyberpunk / Gaming',
  'Enterprise / B2B',
  'Emerald Eco',
  'Sunset Gradient',
  'High Contrast',
  'Soft Pastel',
  'Corporate Blue',
  'Monochrome Pro',
  'Nordic Frost',
] as const;
