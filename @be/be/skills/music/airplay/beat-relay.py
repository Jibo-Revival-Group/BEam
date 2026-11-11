# Started (and restarted) by skills/music/airplay.js. AirPlay's PCM (S16LE stereo 44.1 kHz) comes from ALSA's tee
# (airplay/.asoundrc, pcm.airplay_beat writes this FIFO) and goes to the Music skill's tempo tracker over UDP
# 127.0.0.1:18703. ALSA writes a FIFO, not "|command": that runs through /bin/sh, which Jibo's skill user can't
# execute, and the dead pipe then killed the receiver with SIGPIPE at the first song. Always drained: ALSA's open
# and writes block on a FIFO nobody reads. UDP never blocks; with nobody listening it is dropped.
import ctypes, errno, os, socket, sys
ctypes.CDLL(None).prctl(1, 15)  # PR_SET_PDEATHSIG, SIGTERM: exit with the Be renderer that started us
FIFO = sys.argv[1]
try:
    os.mkfifo(FIFO, 0o600)
except OSError as error:
    if error.errno != errno.EEXIST:
        raise
out = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
while True:
    fd = os.open(FIFO, os.O_RDONLY)  # waits for the next song; EOF when it ends
    while True:
        data = os.read(fd, 8192)
        if not data:
            break
        try:
            out.sendto(data, ('127.0.0.1', 18703))
        except socket.error:
            pass
    os.close(fd)
