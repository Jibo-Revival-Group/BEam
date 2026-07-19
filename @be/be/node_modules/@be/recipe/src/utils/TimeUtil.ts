export default class TimeUtil {

  public static minutesToTime (m: number): { h: number, m: number } {
    return {
      h: Math.trunc(m / 60),
      m: m % 60
    };
  }

  public static secondsToTime (secs: number): { h: string, m: string, s: string } {
    let h: number = Math.floor(secs / 3600);
    let m: number = Math.floor((secs - (h * 3600)) / 60);
    let s: number = Math.floor(secs - (h * 3600) - (m * 60));
    return {
      h: (h < 10 ? '0' : '') + h,
      m: (m < 10 ? '0' : '') + m,
      s: (s < 10 ? '0' : '') + s,
    };
  }

}
