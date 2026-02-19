import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);
const FORBIDDEN_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.google.internal.',
]);

const IPV4_BLOCK_LIST = new BlockList();
const IPV6_BLOCK_LIST = new BlockList();

interface LookupResult {
  readonly address: string;
}
type LookupAllFn = (hostname: string) => Promise<readonly LookupResult[]>;

addBlockedIpv4Subnets();
addBlockedIpv6Subnets();

export async function isPublicHttpUrl(url: URL): Promise<boolean> {
  if (!SUPPORTED_PROTOCOLS.has(url.protocol)) {
    return false;
  }

  if (url.username || url.password) {
    return false;
  }

  return isSafePublicHost(url.hostname);
}

export async function isSafePublicHost(
  rawHostname: string,
  lookupAll: LookupAllFn = defaultLookupAll,
): Promise<boolean> {
  const hostname = normalizeHostname(rawHostname);
  if (!hostname || FORBIDDEN_HOSTNAMES.has(hostname)) {
    return false;
  }

  const ipType = isIP(hostname);
  if (ipType !== 0) {
    return !isBlockedIp(hostname);
  }

  let records: readonly LookupResult[];
  try {
    records = await lookupAll(hostname);
  } catch {
    return false;
  }

  if (records.length === 0) {
    return false;
  }

  return records.every((record) => !isBlockedIp(record.address));
}

async function defaultLookupAll(hostname: string): Promise<readonly LookupResult[]> {
  return lookup(hostname, { all: true, verbatim: true });
}

function normalizeHostname(hostname: string): string {
  const trimmed = hostname.trim().toLowerCase();
  return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
}

function isBlockedIp(address: string): boolean {
  const mappedIpv4 = getIpv4FromMappedIpv6(address);
  if (mappedIpv4) {
    return IPV4_BLOCK_LIST.check(mappedIpv4, 'ipv4');
  }

  const ipType = isIP(address);
  if (ipType === 4) {
    return IPV4_BLOCK_LIST.check(address, 'ipv4');
  }

  if (ipType === 6) {
    return IPV6_BLOCK_LIST.check(address, 'ipv6');
  }

  return true;
}

function getIpv4FromMappedIpv6(address: string): string | null {
  const mappedIpv4Match = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);
  return mappedIpv4Match?.[1] ?? null;
}

function addBlockedIpv4Subnets(): void {
  IPV4_BLOCK_LIST.addSubnet('0.0.0.0', 8, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('10.0.0.0', 8, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('100.64.0.0', 10, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('127.0.0.0', 8, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('169.254.0.0', 16, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('172.16.0.0', 12, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('192.0.0.0', 24, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('192.0.2.0', 24, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('192.88.99.0', 24, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('192.168.0.0', 16, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('198.18.0.0', 15, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('198.51.100.0', 24, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('203.0.113.0', 24, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('224.0.0.0', 4, 'ipv4');
  IPV4_BLOCK_LIST.addSubnet('240.0.0.0', 4, 'ipv4');
}

function addBlockedIpv6Subnets(): void {
  IPV6_BLOCK_LIST.addSubnet('::', 128, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('::1', 128, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('::ffff:0:0', 96, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('100::', 64, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('2001:db8::', 32, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('fc00::', 7, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('fe80::', 10, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('fec0::', 10, 'ipv6');
  IPV6_BLOCK_LIST.addSubnet('ff00::', 8, 'ipv6');
}
