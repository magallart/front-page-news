export interface SectionMockStory {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
}

export const SECTION_MOCK_STORIES: readonly SectionMockStory[] = [
  {
    id: 'mock-001',
    title: 'Titular de ejemplo para seccion',
    summary: 'Este bloque validara la estructura visual mientras usamos datos mock.',
  },
  {
    id: 'mock-002',
    title: 'Segunda noticia de ejemplo',
    summary: 'Mas adelante se sustituye por datos reales de RSS desde la API.',
  },
  {
    id: 'mock-003',
    title: 'Tercera noticia de ejemplo',
    summary: 'Tarjeta base para iterar tipografia, espaciado y jerarquia.',
  },
];

