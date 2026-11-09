# Run by ALSA (airplay/.asoundrc, pcm.airplay_beat): AirPlay's PCM (S16LE stereo 44.1 kHz) arrives on stdin and goes
# to the Music skill's tempo tracker over UDP 127.0.0.1:18703. Python, not node: ALSA blocks AirPlay's audio until
# this reads, and the pipe holds only ~0.37 s; python -S starts in ~0.07 s on Jibo, node in ~0.5 s (an audible stall).
# UDP never blocks: with nobody listening it is dropped, and stdin is always drained.
import os, socket
out = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
while True:
    data = os.read(0, 8192)
    if not data:
        break
    try:
        out.sendto(data, ('127.0.0.1', 18703))
    except socket.error:
        pass
