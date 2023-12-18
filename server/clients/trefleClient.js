'use strict';

const Client = require('./client');

class TrefleClient extends Client {
    constructor(baseUrl, apiKey) {
        super(baseUrl, apiKey);
    }

    searchPlants(query, page) {
        return this.axiosInstance.get('/search', {
            params: {
                q: query,
                page: page || 1
            }
        })
        .then(response => {
            console.log("received response from Trefle API");
            return(response.data);
        })
    }
}

module.exports = TrefleClient;