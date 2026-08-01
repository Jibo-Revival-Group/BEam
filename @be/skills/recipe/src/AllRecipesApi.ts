import jibo = require('jibo');
import request = require('request');

const CLIENT_ID: string = 'Allrecipes_Jibo';
const CLIENT_KEY: string = '2E4F44833803E86C5FB86CBC8C2723DB6A12F1416D14FEFD22001DA8E5096452';

export default class AllRecipesApi {

  public clientAuthorizationKey: string;
  public oauth2TokenObject: any;

  /**
   * @constructor
   */
  constructor() {
    this.clientAuthorizationKey = null;
    this.getClientAuthorizationKey(CLIENT_ID, CLIENT_KEY).then((authorization_key) => {
      console.log(`AllRecipesApi: got clientAuthorizationKey:`);
      console.log(authorization_key);
      this.clientAuthorizationKey = authorization_key;

      this.getOauth2TokenObject(authorization_key).then((token_obj) => {
        console.log(`AllRecipesApi: got oauth2TokenObject:`);
        console.log(token_obj);
        this.oauth2TokenObject = token_obj;

        this.getRecipeWithIdAndOauth2TokenObject('219164', token_obj).then((recipe_obj) => {
          console.log(`AllRecipesApi: got recipe:`);
          console.log(recipe_obj);
        }).catch((error) => {
          console.log('AllRecipesApi: recipe error: ');
          console.log(error);
        });

        this.getFeaturedRecipes('', token_obj).then((recipe_obj) => {
          console.log(`AllRecipesApi: got featured recipes:`);
          console.log(recipe_obj);
        }).catch((error) => {
          console.log('AllRecipesApi: recipe error: ');
          console.log(error);
        });


      }).catch((error) => {
        console.log('AllRecipesApi: oauth2 error: ');
        console.log(error);
      });

    }).catch((error) => {
      console.log('AllRecipesApi: authorization key error: ');
      console.log(error);
    });
  }

  public getClientAuthorizationKey(clientId: string, clientSecret: string): Promise<any> {
    console.log(`getClientAuthorizationKey`);
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: `https://apps.allrecipes.com/v1/oauth2/client-authorization-header?client_id=${clientId}&client_secret=${clientSecret}`,
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          console.log(`AllRecipesApi: got clientAuthorizationKey: ${body}`);
          resolve(body);
        }
      });
    });
  }

  public getOauth2TokenObject(clientAuthorizationKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      request.post({
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${clientAuthorizationKey}`
        },
        url: 'https://apps.allrecipes.com/v1/oauth2/access-token',
        body: 'grant_type=client_credentials'
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          let body_obj: any = JSON.parse(body);
          resolve(body_obj);
        }
      });
    });
  }

  public getRecipeWithIdAndOauth2TokenObject(recipeId: string, oauth2TokenObject: any): Promise<any> {
    return new Promise((resolve, reject) => {
      request.get({
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': `${oauth2TokenObject.token_type} ${oauth2TokenObject.access_token}`
        },
        url: `https://apps.allrecipes.com/v1/recipes/${recipeId}`,
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          let body_obj: any = JSON.parse(body);
          console.log(`AllRecipesApi: got recipe:`);
          resolve(body_obj);
        }
      });
    });
  }

  public getFeaturedRecipes(date: string, oauth2TokenObject: any): Promise<any> {
    return new Promise((resolve, reject) => {
      request.get({
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': `${oauth2TokenObject.token_type} ${oauth2TokenObject.access_token}`
        },
        url: `https://apps.allrecipes.com/v1/featured-recipes?date=${date}`,
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          let body_obj: any = JSON.parse(body);
          console.log(`AllRecipesApi: got featured recipes:`);
          resolve(body_obj);
        }
      });
    });
  }
}
