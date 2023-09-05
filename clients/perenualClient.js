'use strict';

const Client = require('./client');
const PlantsResponse = require('../apiModels/plantsResponse');

class PerenualClient extends Client {
    constructor(baseUrl, apiKey) {
        super(baseUrl, apiKey);
    }

    searchPlants(query, page) {
        return this.axiosInstance.get(`/species-list?key=${this.apiKey}`, {
            params: {
                q: query,
                page: page || 1
            }
        })
        .then(response => {
            console.log("received response from Perenual API");
            return(PlantsResponse.fromPerenualResponse(response.data));
        })
    }

    static createInfoUrls(plantId) {
        return {
           details: "https://perenual.com/api/species/details/" + plantId,
           careGuide: "https://perenual.com/api/species/care-guide-list?species_id=" + plantId,
        };
    }
}

module.exports = PerenualClient;