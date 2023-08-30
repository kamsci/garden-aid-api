'use strict';

const axios = require('axios');

class Client {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;

        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 1000,
            headers: {'Authorization': `Bearer ${apiKey}`}
          });
    }
}

module.exports = Client;