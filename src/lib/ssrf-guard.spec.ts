import { describe, expect, it } from 'vitest';

import { isPublicHttpUrl, isSafePublicHost } from './ssrf-guard';

describe('ssrf-guard', () => {
  it('accepts public IPv4 hosts', async () => {
    const lookupAll = async () => [{ address: '93.184.216.34' }];

    const result = await isSafePublicHost('example.com', lookupAll);

    expect(result).toBe(true);
  });

  it('rejects local and metadata hostnames', async () => {
    expect(await isSafePublicHost('localhost')).toBe(false);
    expect(await isSafePublicHost('metadata.google.internal')).toBe(false);
  });

  it('rejects private IPv4 targets', async () => {
    expect(await isSafePublicHost('10.0.1.10')).toBe(false);
    expect(await isSafePublicHost('192.168.1.20')).toBe(false);
    expect(await isSafePublicHost('169.254.169.254')).toBe(false);
  });

  it('rejects hosts that resolve to private IPs', async () => {
    const lookupAll = async () => [{ address: '10.1.2.3' }];

    const result = await isSafePublicHost('internal.example.test', lookupAll);

    expect(result).toBe(false);
  });

  it('rejects mixed DNS answers when any record is blocked', async () => {
    const lookupAll = async () => [
      { address: '93.184.216.34' },
      { address: '10.2.3.4' },
    ];

    const result = await isSafePublicHost('mixed.example.test', lookupAll);

    expect(result).toBe(false);
  });

  it('rejects forbidden protocols and credentials in URL', async () => {
    const ftpUrl = new URL('ftp://example.com/image.jpg');
    const credentialUrl = new URL('https://user:pass@example.com/image.jpg');

    expect(await isPublicHttpUrl(ftpUrl)).toBe(false);
    expect(await isPublicHttpUrl(credentialUrl)).toBe(false);
  });
});
