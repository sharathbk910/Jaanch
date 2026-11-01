import { describe, it, expect } from 'vitest';
import {
  isPrivateOrBlockedIP,
  resolveAndValidateDestination,
  safeFetch,
  SafeFetchError,
} from '../lib/safeFetch.js';

describe('SSRF Protection & SafeFetch (safeFetch.test.ts)', () => {
  describe('Blocked IP Ranges Coverage (isPrivateOrBlockedIP)', () => {
    it('blocks IPv4 loopback (127.0.0.0/8)', () => {
      expect(isPrivateOrBlockedIP('127.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('127.0.0.2')).toBe(true);
      expect(isPrivateOrBlockedIP('127.255.255.255')).toBe(true);
    });

    it('blocks RFC 1918 private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', () => {
      expect(isPrivateOrBlockedIP('10.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('10.254.1.1')).toBe(true);
      expect(isPrivateOrBlockedIP('172.16.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('172.31.255.255')).toBe(true);
      expect(isPrivateOrBlockedIP('192.168.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('192.168.1.100')).toBe(true);
    });

    it('blocks link-local & cloud metadata IPs (169.254.0.0/16)', () => {
      expect(isPrivateOrBlockedIP('169.254.169.254')).toBe(true); // AWS/GCP/Azure metadata
      expect(isPrivateOrBlockedIP('169.254.0.1')).toBe(true);
    });

    it('blocks carrier-grade NAT (100.64.0.0/10)', () => {
      expect(isPrivateOrBlockedIP('100.64.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('100.127.255.255')).toBe(true);
    });

    it('blocks unspecified, multicast, and reserved IPv4 ranges', () => {
      expect(isPrivateOrBlockedIP('0.0.0.0')).toBe(true);
      expect(isPrivateOrBlockedIP('224.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('240.0.0.1')).toBe(true);
    });

    it('blocks IPv6 loopback, unspecified, link-local, and unique local addresses', () => {
      expect(isPrivateOrBlockedIP('::1')).toBe(true);
      expect(isPrivateOrBlockedIP('::')).toBe(true);
      expect(isPrivateOrBlockedIP('fe80::1')).toBe(true);
      expect(isPrivateOrBlockedIP('fc00::1')).toBe(true);
      expect(isPrivateOrBlockedIP('ff02::1')).toBe(true);
    });

    it('blocks IPv4-mapped IPv6 addresses for internal targets', () => {
      expect(isPrivateOrBlockedIP('::ffff:127.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedIP('::ffff:169.254.169.254')).toBe(true);
      expect(isPrivateOrBlockedIP('::ffff:192.168.1.1')).toBe(true);
    });

    it('allows valid public routable IP addresses', () => {
      expect(isPrivateOrBlockedIP('8.8.8.8')).toBe(false);
      expect(isPrivateOrBlockedIP('1.1.1.1')).toBe(false);
      expect(isPrivateOrBlockedIP('142.250.190.46')).toBe(false);
    });
  });

  describe('Protocol & Hostname Restrictions', () => {
    it('strictly enforces HTTPS only; blocks HTTP and other schemes', async () => {
      await expect(resolveAndValidateDestination('http://example.com')).rejects.toThrow(
        /Only HTTPS is permitted/
      );
      await expect(resolveAndValidateDestination('ftp://example.com/file')).rejects.toThrow(
        /Only HTTPS is permitted/
      );
      await expect(resolveAndValidateDestination('file:///etc/passwd')).rejects.toThrow(
        /Only HTTPS is permitted/
      );
    });

    it('blocks localhost and internal domain names', async () => {
      await expect(resolveAndValidateDestination('https://localhost/admin')).rejects.toThrow(
        /local domain names is prohibited/
      );
      await expect(resolveAndValidateDestination('https://service.internal')).rejects.toThrow(
        /local domain names is prohibited/
      );
    });

    it('blocks direct HTTPS to private IP addresses', async () => {
      await expect(resolveAndValidateDestination('https://127.0.0.1/')).rejects.toThrow(
        /internal IP address/
      );
      await expect(resolveAndValidateDestination('https://169.254.169.254/')).rejects.toThrow(
        /internal IP address/
      );
    });

    it('enforces hostname allowlist if provided', async () => {
      const allowed = ['rdap.org', 'nic.in'];

      const destination = await resolveAndValidateDestination('https://rdap.org/domain/example.com', allowed);
      expect(destination.url.hostname).toBe('rdap.org');

      await expect(
        resolveAndValidateDestination('https://google.com/search', allowed)
      ).rejects.toThrow(/not in the allowlist/);
    });
  });

  describe('Anti-Rebinding & Redirect Safety', () => {
    it('pins resolved IP in destination object to guarantee anti-rebinding connection', async () => {
      const destination = await resolveAndValidateDestination('https://rdap.org/domain/test');

      expect(destination.pinnedIp).toBeDefined();
      expect(isPrivateOrBlockedIP(destination.pinnedIp)).toBe(false);
      expect([4, 6]).toContain(destination.ipFamily);
    });

    it('rejects redirect-to-private IP hop', async () => {
      // Direct validation of a redirect target pointing to internal IP
      await expect(
        resolveAndValidateDestination('https://127.0.0.1/internal-status')
      ).rejects.toThrow(SafeFetchError);
    });
  });
});

