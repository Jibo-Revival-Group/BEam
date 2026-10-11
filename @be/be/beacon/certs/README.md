# Store download certificate authorities

`mozilla-ca.pem` is Mozilla's public root certificate bundle converted by curl:
https://curl.se/docs/caextract.html

Downloaded from https://curl.se/ca/cacert.pem on 2026-10-10; Mozilla data dated
2026-09-25. Verified against https://curl.se/ca/cacert.pem.sha256:

```
a41b5d356aea97a529fe27e0f7316d2f9d946d75927476cf9cf1b90637d00505
```

The bundle is distributed under Mozilla Public License 2.0 (see LICENSE).
The original source and conversion links are also in the PEM header.
When updating, download both files over verified HTTPS, compare the hash and
update this record. The bundle ships with BEam and requires no network fetch
at startup. Update it as part of BEam releases to keep public roots current.

Only theme/store HTTPS requests use this bundle. Certificate chain, expiration
and hostname checks remain enabled. Redirects use the same trust configuration.
