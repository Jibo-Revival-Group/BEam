# AirPlay receiver

`shairport-sync` is shairport-sync 4.3.7 (classic AirPlay) built for Jibo: 32-bit ARM, glibc 2.21, linked to Jibo's own ALSA and avahi libraries, with mbedTLS 2.28.9, libconfig 1.7.3 and popt 1.19 built in. `../airplay.js` starts it with `airplay.conf`.

## The one change to shairport-sync

At the top of `main()` in `shairport.c`:

```c
#include <sys/prctl.h>
...
  prctl(PR_SET_PDEATHSIG, SIGTERM); // exit with the Be renderer that started us, never orphaned
```

## Rebuilding

- C compiler: zig 0.17 (`pip install ziglang`) as `zig cc -target arm-linux-gnueabihf.2.21 -mcpu=cortex_a15`, and `zig c++` for linking.
- Link with `-Wl,-z,lazy`. Jibo's glibc 2.21 loader crashes on zig's default BIND_NOW layout as soon as a program uses a libc variable such as `stdout`.
- Build mbedTLS, libconfig and popt as static libraries. Take the ALSA (1.0.29) and avahi (0.6.31) headers from their source releases, and link against `libasound.so.2`, `libavahi-client.so.3` and `libavahi-common.so.3` copied from a Jibo.
- Configure: `./configure --host=arm-linux-gnueabihf --with-alsa --with-avahi --with-ssl=mbedtls --with-metadata --without-libdaemon --sysconfdir=/etc` with `LIBS="-lmbedx509 -lmbedcrypto"`, then strip.

## Licences

- shairport-sync: MIT (its ALAC decoder is MIT; see the shairport-sync `LICENSES` file).
- mbedTLS: Apache 2.0.
- popt: MIT.
- libconfig: LGPL 2.1. It is linked statically, and the steps above rebuild the binary from the unmodified libconfig 1.7.3 source.
