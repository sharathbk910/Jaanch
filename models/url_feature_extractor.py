"""Real-time URL feature extraction engine for Jaanch Phishing Detection.

Extracts 18 lexical, structural, and domain-hierarchy features:
1. url_length
2. num_dots
3. has_https
4. has_ip
5. num_subdirs
6. num_params
7. suspicious_words
8. tld
9. special_char_count
10. digits_count
11. entropy (Shannon string entropy)
12. digits_ratio & special_ratio
13. subdomain_len
14. subdomain_dots
15. subdomain_hyphens
16. root_hyphens
17. subdomain_brand
18. is_gov
"""

import math
import re
from typing import Dict, Any, Tuple
from urllib.parse import urlparse

# Standard credential-harvesting, impersonation, and phishing indicator keywords
SUSPICIOUS_KEYWORDS = {
    "login", "signin", "verify", "verification", "account", "update", "security",
    "banking", "secure", "confirm", "confirmation", "ebay", "paypal", "support",
    "wallet", "billing", "password", "kyc", "otp", "auth", "authenticate",
    "webscr", "relogin", "recover", "suspicious", "free", "gift", "bonus",
    "telegram", "earning", "cashback", "registration", "fee"
}

BRAND_KEYWORDS = {
    "gov", "nic", "scholarship", "aicte", "paypal", "google", "microsoft",
    "apple", "amazon", "bank", "sbi", "hdfc", "icici", "login", "verify",
    "secure", "update", "support", "telegram"
}

TWO_PART_TLDS = {
    "gov.in", "nic.in", "ac.in", "co.in", "co.uk", "org.uk", "gov.uk",
    "com.br", "com.au", "co.za", "res.in", "edu.in", "ernet.in", "net.in"
}

IP_REGEX = re.compile(
    r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?$"
)

SPECIAL_CHARS = set("-–_~:/?#[]@!$&'()*+,;=%")


def calculate_shannon_entropy(text: str) -> float:
    """Calculates Shannon string entropy H = -sum(p_i * log2(p_i))."""
    if not text:
        return 0.0
    length = len(text)
    freq: Dict[str, int] = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def parse_domain_hierarchy(host: str) -> Tuple[str, str, str, int]:
    """
    Parses hostname into (root_domain, subdomain, tld, is_ip).
    Handles multi-part TLDs like .gov.in, .co.uk.
    """
    if not host:
        return "", "", "none", 0
    if IP_REGEX.match(host):
        return host, "", "ip", 1

    parts = host.lower().split(".")
    if len(parts) >= 2:
        suffix2 = ".".join(parts[-2:])
        if suffix2 in TWO_PART_TLDS and len(parts) >= 3:
            root_domain = ".".join(parts[-3:])
            subdomain = ".".join(parts[:-3])
            tld = suffix2
        else:
            root_domain = ".".join(parts[-2:])
            subdomain = ".".join(parts[:-2])
            tld = parts[-1]
    else:
        root_domain = host
        subdomain = ""
        tld = "none"

    return root_domain, subdomain, tld, 0


def extract_url_features(url: str) -> Dict[str, Any]:
    """
    Extracts all 18 engineered features from a raw URL.
    Returns a dictionary suitable for passing directly to the trained ML model.
    """
    raw_url = str(url).strip()
    if not raw_url.startswith(("http://", "https://")):
        parsed_raw = "http://" + raw_url
    else:
        parsed_raw = raw_url

    try:
        parsed = urlparse(parsed_raw)
        host = parsed.netloc.split(":")[0].lower() if parsed.netloc else ""
        path = parsed.path or ""
        query = parsed.query or ""
    except Exception:
        host, path, query = "", parsed_raw, ""

    root_domain, subdomain, tld, is_ip = parse_domain_hierarchy(host)

    url_length = len(raw_url)
    num_dots = raw_url.count(".")
    has_https = 1 if raw_url.lower().startswith("https://") else 0
    num_subdirs = path.count("/")
    num_params = query.count("&") + (1 if query else 0)

    url_lower = raw_url.lower()
    suspicious_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)

    special_char_count = sum(1 for c in raw_url if c in SPECIAL_CHARS)
    digits_count = sum(1 for c in raw_url if c.isdigit())
    entropy = calculate_shannon_entropy(raw_url)

    digits_ratio = round(digits_count / max(url_length, 1), 4)
    special_ratio = round(special_char_count / max(url_length, 1), 4)

    subdomain_len = len(subdomain)
    subdomain_dots = subdomain.count(".")
    subdomain_hyphens = subdomain.count("-")
    root_hyphens = root_domain.count("-")

    # Subdomain brand spoofing check
    subdomain_brand = sum(1 for b in BRAND_KEYWORDS if b in subdomain)

    # Official government TLD check (.gov.in or .nic.in)
    is_gov = 1 if (root_domain.endswith(".gov.in") or root_domain.endswith(".nic.in")) else 0

    return {
        "url": raw_url,
        "url_length": url_length,
        "num_dots": num_dots,
        "has_https": has_https,
        "has_ip": is_ip,
        "num_subdirs": num_subdirs,
        "num_params": num_params,
        "suspicious_words": suspicious_count,
        "tld": tld,
        "special_char_count": special_char_count,
        "digits_count": digits_count,
        "entropy": entropy,
        "digits_ratio": digits_ratio,
        "special_ratio": special_ratio,
        "subdomain_len": subdomain_len,
        "subdomain_dots": subdomain_dots,
        "subdomain_hyphens": subdomain_hyphens,
        "root_hyphens": root_hyphens,
        "subdomain_brand": subdomain_brand,
        "is_gov": is_gov
    }
