/**
 * @fileOverview
 *
 * Created on 5/12/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

export interface Callback<T> {
  (error: any, data?: T): any;
}

export interface NonStandardCallback<T> {
  (data?: T): any;
}

export class PromiseUtils {

	/**
	 * Installs a global handler for unhandled rejected promises
	 * Makes sure to only install one instance.
	 */
  static catchUnhandledRejection () {
    let gl: any = global;

    if (!gl._hasInstalledUncaughtHandler) {
      process.on('unhandledRejection', (reason, p) => {
        console.error(`Unhandled Rejection at: Promise '${JSON.stringify(p)}'`);
        if (reason instanceof Error) {
          console.error(`message: ${reason.message}`);
          console.error(`stack: ${reason.stack}`);
        } else {
          console.error(reason);
        }
      });
      gl._hasInstalledUncaughtHandler = true;
    }
  }

	/**
	 * Returns promise that succeeds when the first input promise succeeds
	 * If all input promises fail, then the returned promise fails.
	 * @param {Promise<T>[]} promises
	 * @returns {Promise<T>}
	 */
  static async firstToSucceed<T> (promises: Promise<T>[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let errors = [];
      let errorCount = 0;

      for (let i = 0; i < promises.length; i++) {
        promises[i].then(resolve).catch(e => {
          errors[i] = e;
          if (++errorCount === promises.length) {
            reject(errors);
          }
        });
      }
    });
  }

	/**
	 * A method that allows you to convert a 'callback' async function to
	 * a promise async function. The only requirement is that the callback
	 * signature must be of type (error: any, data?: any)
	 * @param {Function.<Callback>} func
	 * @returns {Promise<any>}
	 */
  static promisify<T> (func: (cb: Callback<T>) => any): Promise<T>;
	/**
	 * A method that allows you to convert a 'callback' async function to
	 * a promise async function. The only requirement is that the callback
	 * signature must be of type (data?: any)
	 * @param {Function.<NonStandardCallback>} func
	 * @param {boolean} [firstParamError=true] Must be set to false if first argument in callback
	 * will not be an error message but the data itself
	 * @returns {Promise<any>}
	 */
  static promisify<T> (func: (cb: NonStandardCallback<T>) => any, firstParamError: boolean): Promise<T>;
  static promisify<T> (func: (cb: Callback<T> | NonStandardCallback<T>) => any, firstParamError = true): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      func((error, result) => {
        if (firstParamError) {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
        else {
          // In this case it is assumed that the data is in the first argument
          if (result) {
            console.warn(`Data in second argument ignored`);
          }
          resolve(error);
        }
      });
    });
  }
}
