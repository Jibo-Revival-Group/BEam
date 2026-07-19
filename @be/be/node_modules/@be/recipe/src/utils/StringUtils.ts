export default class StringUtils {

  constructor () {
    throw 'StringUtils is static and cannot be instantiated';
  }

  public static supplant (str: string, values: any): string {
    Object.keys(values).forEach(key => {
      // Coerce null/undefined to '' so an unresolved value (e.g. a missing user
      // name under jibo 14) never gets spoken as the literal word "undefined".
      const value = values[key] == null ? '' : values[key];
      str = str.replace(new RegExp('\\$\\{'+key+'\\}', 'gi'), value);
    });
    // jibo 14 has no processor for recipe's legacy <tts config='...'> markup, so
    // strip it (as directions already do) to avoid Jibo reading the tags aloud.
    return StringUtils.stripTts(str);
  }

  public static stripTts (str: string): string {
    return str.replace(/<\/?tts[^>]*>/gi, '');
  }

  public static stripSSA (str: string): string {
    return StringUtils.stripTts(str);
  }

}
