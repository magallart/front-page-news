import type { Source } from '../../interfaces/source.interface';

const SOURCE_HOMEPAGE_BY_ID: Readonly<Record<string, string>> = {
  'source-abc': 'https://www.abc.es',
  'source-as': 'https://as.com',
  'source-el-confidencial': 'https://www.elconfidencial.com',
  'source-el-correo': 'https://www.elcorreo.com',
  'source-el-diario-es': 'https://www.eldiario.es',
  'source-el-espanol': 'https://www.elespanol.com',
  'source-el-mundo': 'https://www.elmundo.es',
  'source-el-pais': 'https://elpais.com',
  'source-el-periodico-mediterraneo': 'https://www.elperiodicomediterraneo.com',
  'source-esdiario': 'https://www.esdiario.com',
  'source-expansion': 'https://www.expansion.com',
  'source-la-vanguardia': 'https://www.lavanguardia.com',
  'source-la-voz-de-galicia': 'https://www.lavozdegalicia.es',
  'source-libertad-digital': 'https://www.libertaddigital.com',
  'source-marca': 'https://www.marca.com',
  'source-okdiario': 'https://okdiario.com',
};

export function resolveSourceHomepage(source: Source): string {
  return SOURCE_HOMEPAGE_BY_ID[source.id] ?? source.baseUrl;
}
