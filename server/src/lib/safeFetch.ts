import dns from 'node:dns/promises';
import net from 'node:net';
import { Agent, request as undiciRequest } from 'undici';

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  allowedHostnames?: string[];
  headers?: Record<string, string>;
  maxRedirects?: number;
}

export interface SafeFetchResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  text: () => Promise<string>;
  json: <T = unknown>() => Promise<T>;
}

export class SafeFetchError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'SafeFetchError';
  }
}

/**
 * Checks whether an IPv4 or IPv6 address belongs to private, loopback, link-local,
 * CGNAT, metadata, or multicast/reserved networks (SSRF defense).
 */
export function isPrivateOrBlockedIP(ip: string): boolean {
  if (!net.isIP(ip)) {
    return true; // Not a valid IP address
  }

  // Handle IPv4
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [b0, b1, b2] = parts;

    // 0.0.0.0/8 (unspecified)
    if (b0 === 0) return true;

    // 10.0.0.0/8 (RFC 1918 private)
    if (b0 === 10) return true;

    // 100.64.0.0/10 (RFC 6598 carrier-grade NAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // 127.0.0.0/8 (loopback)
    if (b0 === 127) return true;

    // 169.254.0.0/16 (RFC 3927 link-local & cloud metadata 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;

    // 172.16.0.0/12 (RFC 1918 private)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.0.0.0/24 (RFC 6890 IETF protocol assignments)
    if (b0 === 192 && b1 === 0 && b2 === 0) return true;

    // 192.0.2.0/24 (TEST-NET-1)
    if (b0 === 192 && b1 === 0 && b2 === 2) return true;

    // 192.168.0.0/16 (RFC 1918 private)
    if (b0 === 192 && b1 === 168) return true;

    // 198.18.0.0/15 (benchmarking)
    if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;

    // 198.51.100.0/24 (TEST-NET-2)
    if (b0 === 198 && b1 === 51 && b2 === 100) return true;

    // 203.0.113.0/24 (TEST-NET-3)
    if (b0 === 203 && b1 === 0 && b2 === 113) return true;

    // 224.0.0.0/4 (multicast)
    if (b0 >= 224 && b0 <= 239) return true;

    // 240.0.0.0/4 (reserved / future use)
    if (b0 >= 240) return true;

    return false;
  }

  // Handle IPv6
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();

    // :: or ::1 (unspecified or loopback)
    if (
      normalized === '::' ||
      normalized === '::1' ||
      normalized === '0:0:0:0:0:0:0:1' ||
      normalized === '0:0:0:0:0:0:0:0'
    ) {
      return true;
    }

    // IPv4-mapped IPv6 ::ffff:a.b.c.d
    if (normalized.startsWith('::ffff:')) {
      const v4Part = normalized.replace('::ffff:', '');
      if (net.isIPv4(v4Part)) {
        return isPrivateOrBlockedIP(v4Part);
      }
    }

    // fe80::/10 (link-local)
    if (/^fe[89ab][0-9a-f]:/i.test(normalized)) return true;

    // fc00::/7 (unique local address - private)
    if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) return true;

    // ff00::/8 (multicast)
    if (normalized.startsWith('ff')) return true;

    return false;
  }

  return true;
}

export interface ValidatedDestination {
  url: URL;
  pinnedIp: string;
  ipFamily: 4 | 6;
}

/**
 * Validates target URL against SSRF vulnerabilities:
 * - Scheme must be strictly HTTPS
 * - Hostname cannot be localhost or internal domain variants
 * - Resolves DNS and confirms NO IP is private/blocked
 * - Returns verified destination with pinned IP for anti-rebinding connection
 */
export async function resolveAndValidateDestination(
  rawUrl: string,
  allowedHostnames?: string[]
): Promise<ValidatedDestination> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new SafeFetchError('Invalid URL format', 'INVALID_URL');
  }

  // HTTPS only requirement
  if (parsedUrl.protocol !== 'https:') {
    throw new SafeFetchError(`Unsupported protocol '${parsedUrl.protocol}'. Only HTTPS is permitted.`, 'BLOCKED_PROTOCOL');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Allowlist enforcement
  if (allowedHostnames && allowedHostnames.length > 0) {
    const isAllowed = allowedHostnames.some((allowed) => {
      const clean = allowed.toLowerCase().trim();
      return hostname === clean || hostname.endsWith(`.${clean}`);
    });
    if (!isAllowed) {
      throw new SafeFetchError(`Hostname '${hostname}' is not in the allowlist`, 'HOSTNAME_NOT_ALLOWED');
    }
  }

  // Block localhost strings
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new SafeFetchError('Access to local domain names is prohibited', 'BLOCKED_HOST');
  }

  // Direct IP address handling
  if (net.isIP(hostname)) {
    if (isPrivateOrBlockedIP(hostname)) {
      throw new SafeFetchError(`Direct access to internal IP address '${hostname}' is blocked`, 'SSRF_BLOCKED_IP');
    }
    const ipFamily = net.isIPv4(hostname) ? 4 : 6;
    return { url: parsedUrl, pinnedIp: hostname, ipFamily };
  }

  // Resolve hostname via DNS
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new SafeFetchError(`Failed to resolve DNS for host '${hostname}'`, 'DNS_RESOLUTION_FAILED');
    }
  } catch (err: unknown) {
    if (err instanceof SafeFetchError) throw err;
    throw new SafeFetchError(
      `DNS lookup failed for '${hostname}': ${err instanceof Error ? err.message : String(err)}`,
      'DNS_RESOLUTION_FAILED'
    );
  }

  // Verify all resolved addresses
  for (const record of addresses) {
    if (isPrivateOrBlockedIP(record.address)) {
      throw new SafeFetchError(
        `Host '${hostname}' resolved to blocked/internal IP '${record.address}'`,
        'SSRF_BLOCKED_IP'
      );
    }
  }

  const primary = addresses[0];
  const ipFamily = primary.family === 6 ? 6 : 4;

  return {
    url: parsedUrl,
    pinnedIp: primary.address,
    ipFamily,
  };
}

/**
 * SSRF-Safe outbound HTTP client using Undici with pinned resolved IP.
 * Guarantees connection to the verified IP, immune to DNS rebinding attacks.
 * Re-validates every redirect hop.
 */
export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse> {
  const { timeoutMs = 5000, maxBytes = 1024 * 1024, allowedHostnames, headers = {}, maxRedirects = 3 } = options;

  let currentUrl = rawUrl;
  let redirectsRemaining = maxRedirects;

  while (redirectsRemaining >= 0) {
    const destination = await resolveAndValidateDestination(currentUrl, allowedHostnames);
    const { url, pinnedIp, ipFamily } = destination;

    // Create an undici Agent that pins the resolved IP and enforces SNI
    const agent = new Agent({
      connect: {
        lookup: (_hostname, _opts, callback) => {
          callback(null, [{ address: pinnedIp, family: ipFamily }]);
        },
        servername: url.hostname,
      },
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await undiciRequest(url.toString(), {
        dispatcher: agent,
        method: 'GET',
        headers: {
          'user-agent': 'Jaanch-Safety-Bot/1.0',
          accept: 'application/json, text/plain, */*',
          host: url.host,
          ...headers,
        },
        signal: controller.signal,
      });

      // Handle redirect safely
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const locationHeader = res.headers['location'];
        const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;
        if (!location) {
          throw new SafeFetchError('Redirect response without Location header', 'INVALID_REDIRECT');
        }

        currentUrl = new URL(location, url).toString();
        redirectsRemaining--;
        continue;
      }

      // Check content-length header
      const contentLengthHeader = res.headers['content-length'];
      const contentLength = contentLengthHeader
        ? parseInt(Array.isArray(contentLengthHeader) ? contentLengthHeader[0] : contentLengthHeader, 10)
        : null;

      if (contentLength && contentLength > maxBytes) {
        throw new SafeFetchError(`Response size ${contentLength} exceeds limit of ${maxBytes} bytes`, 'PAYLOAD_TOO_LARGE');
      }

      // Buffer body with length enforcement
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      for await (const chunk of res.body) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buf.length;
        if (totalBytes > maxBytes) {
          throw new SafeFetchError(`Response body exceeded maximum size limit of ${maxBytes} bytes`, 'PAYLOAD_TOO_LARGE');
        }
        chunks.push(buf);
      }

      const fullBuffer = Buffer.concat(chunks);
      const textBody = fullBuffer.toString('utf-8');

      return {
        status: res.statusCode,
        headers: res.headers as Record<string, string | string[] | undefined>,
        text: async () => textBody,
        json: async <T = unknown>() => JSON.parse(textBody) as T,
      };
    } catch (err: unknown) {
      if (err instanceof SafeFetchError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new SafeFetchError(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT');
      }
      throw new SafeFetchError(
        `Outbound request failed: ${err instanceof Error ? err.message : String(err)}`,
        'NETWORK_ERROR'
      );
    } finally {
      clearTimeout(timer);
      await agent.destroy();
    }
  }

  throw new SafeFetchError('Exceeded maximum redirect limit', 'TOO_MANY_REDIRECTS');
}
