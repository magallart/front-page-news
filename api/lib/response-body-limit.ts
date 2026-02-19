export class PayloadTooLargeError extends Error {
  constructor(message = 'Payload exceeds allowed size') {
    super(message);
    this.name = 'PayloadTooLargeError';
  }
}

function assertValidMaxBytes(maxBytes: number): void {
  if (maxBytes <= 0) {
    throw new Error('maxBytes must be greater than zero');
  }
}

function assertContentLengthWithinLimit(response: Response, maxBytes: number): void {
  const contentLengthHeader = response.headers.get('content-length');
  const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : Number.NaN;
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new PayloadTooLargeError();
  }
}

function concatUint8Arrays(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const result = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}

export async function readResponseBodyWithLimit(response: Response, maxBytes: number): Promise<Uint8Array> {
  assertValidMaxBytes(maxBytes);
  assertContentLengthWithinLimit(response, maxBytes);

  if (!response.body) {
    return new Uint8Array(0);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = value;
    totalBytes += chunk.byteLength;
    if (totalBytes > maxBytes) {
      throw new PayloadTooLargeError();
    }

    chunks.push(chunk);
  }

  return concatUint8Arrays(chunks, totalBytes);
}

export async function streamResponseBodyWithLimit(
  response: Response,
  maxBytes: number,
  onChunk: (chunk: Uint8Array) => Promise<void> | void,
): Promise<number> {
  assertValidMaxBytes(maxBytes);
  assertContentLengthWithinLimit(response, maxBytes);

  if (!response.body) {
    return 0;
  }

  const reader = response.body.getReader();
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = value;
      totalBytes += chunk.byteLength;
      if (totalBytes > maxBytes) {
        throw new PayloadTooLargeError();
      }

      await onChunk(chunk);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  }

  return totalBytes;
}
