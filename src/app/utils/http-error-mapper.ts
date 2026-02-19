import { APP_HTTP_ERROR_KIND } from '../interfaces/app-http-error-kind.interface';

import type { AppHttpErrorKind } from '../interfaces/app-http-error-kind.interface';

type HttpErrorMessageInput = Readonly<{
  kind: AppHttpErrorKind;
  status: number | null;
}>;

export function mapHttpErrorToUserMessage(input: HttpErrorMessageInput): string {
  switch (input.kind) {
    case APP_HTTP_ERROR_KIND.OFFLINE:
      return 'No hay conexión a internet. Revisa tu red e inténtalo de nuevo.';
    case APP_HTTP_ERROR_KIND.TIMEOUT:
      return 'La petición tardó demasiado. Inténtalo de nuevo en unos segundos.';
    case APP_HTTP_ERROR_KIND.NETWORK:
      return 'No se pudo contactar con el servicio. Inténtalo de nuevo en unos minutos.';
    case APP_HTTP_ERROR_KIND.SERVER:
      return 'El servicio no está disponible temporalmente. Inténtalo de nuevo en unos minutos.';
    case APP_HTTP_ERROR_KIND.CLIENT:
      return mapClientStatusToMessage(input.status);
    default:
      return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
}

function mapClientStatusToMessage(status: number | null): string {
  if (status === 401 || status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (status === 404) {
    return 'El recurso solicitado no existe o ya no está disponible.';
  }

  if (status === 400 || status === 422) {
    return 'La solicitud contiene datos no válidos.';
  }

  if (status === 429) {
    return 'Hay demasiadas solicitudes en este momento. Espera un momento e inténtalo de nuevo.';
  }

  return 'No se pudo completar la solicitud.';
}
