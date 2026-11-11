# AirPlay receiver

`shairport-sync` is shairport-sync 4.3.7 (classic AirPlay) built for Jibo: 32-bit ARM, glibc 2.21, linked to Jibo's own ALSA and avahi libraries, with mbedTLS 2.28.9, libconfig 1.7.3, popt 1.19 and Apple's ALAC decoder (mikebrady/alac) built in. Use Apple's decoder: shairport's default Hammerton decoder corrupts the heap on some frames (`unhandled prediction type`, then a `malloc` assertion) and the receiver dies mid-song. `../airplay.js` starts it with `airplay.conf`.

## Changes to shairport-sync

1. At the top of `main()` in `shairport.c`, so the receiver exits with the Be renderer that started it and is never orphaned:

```c
#include <sys/prctl.h>
...
  prctl(PR_SET_PDEATHSIG, SIGTERM);
```

2. In `rtp.c`'s control thread, just before `if (conn->local_to_remote_time_difference) {` in the sync-packet handler. The first sync packet often arrives before the first clock exchange and was dropped, so timing only started with the next sync packet a second later. With `airplay.conf`'s shorter latency, that second of audio was already due and got skipped:

```c
for (int jibo_wait = 0; jibo_wait < 50 && conn->local_to_remote_time_difference == 0; jibo_wait++)
  usleep(10000);
```

## Rebuilding

- C compiler: zig 0.17 (`pip install ziglang`) as `zig cc -target arm-linux-gnueabihf.2.21 -mcpu=cortex_a15`, and `zig c++` for linking.
- Link with `-Wl,-z,lazy`. Jibo's glibc 2.21 loader crashes on zig's default BIND_NOW layout as soon as a program uses a libc variable such as `stdout`.
- Build mbedTLS, libconfig, popt and alac (mikebrady/alac, `autoreconf -fi` first) as static libraries. Take the ALSA (1.0.29) and avahi (0.6.31) headers from their source releases, and link against `libasound.so.2`, `libavahi-client.so.3` and `libavahi-common.so.3` copied from a Jibo.
- Configure: `./configure --host=arm-linux-gnueabihf --with-alsa --with-avahi --with-ssl=mbedtls --with-metadata --with-apple-alac --without-libdaemon --sysconfdir=/etc` with `LIBS="-lmbedx509 -lmbedcrypto"`, and `alsa_`/`libconfig_`/`popt_`/`alac_` `CFLAGS`/`LIBS` set by hand (there are no `.pc` files for Jibo's ALSA). Strip with `arm-linux-gnueabihf-strip`. `-V` must say `alac`.

## Licences

- shairport-sync: MIT.
- Apple ALAC decoder: Apache 2.0.
- mbedTLS: Apache 2.0.
- popt: MIT.
- libconfig: LGPL 2.1. It is linked statically, and the steps above rebuild the binary from the unmodified libconfig 1.7.3 source.
