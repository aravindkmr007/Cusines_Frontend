import axios from "axios";
import Config from "./Config.json";

const dispatcher = (function () {
  /* Calls user required API 
       Also ensures session for the user(if session is unavailable in browser cookie) 
    */
  function callAPI(options) {
    return new Promise((resolve, reject) => {

      options.headers = options.headers || {};

      axios({
        url: Config[Config.environment + "_host"] + options.url,
        method: options.method || "get",
        headers: options.headers,
        data: options.data || {},
        query: options.query || {},
        params: options.params || {},
      })
        .then((response) => {
          resolve(response);
        })
        .catch((err, msg) => {
          if (err.response) {
            reject(err.response.data);
          } else {
            reject(err.message);
          }
          console.log("Error response in callAPI: ", err);
        });
    });
  }

  /*
     Default method to call an API with custom options
      This method invokes callAPI method after providing cookie availability in options
     */
  function call(options) {
    return new Promise((resolve, reject) => {
      callAPI(options)
        .then((result) => {
          if (/^2\d\d$/gi.test(result.status)) {
            resolve(result.data);
          } else reject(result);
        })
        .catch((err) => {
          reject(err);
          console.log("Error occurs in Call: ", err);
        });
    });
  }

  return {
    call,
  };
})();

export default dispatcher;
