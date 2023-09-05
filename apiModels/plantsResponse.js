'use strict';
const PlantResponse = require('./plantResponse');
const TREFLE_PER_PAGE = 20;
const UI_PER_PAGE = 10;

class PlantsResponse {
    constructor() {
        this.data = [];
        this.lastPage = 0;
        this.perPage = 0;
        this.total = 0;
    }

    static calculatePages(totalItems, itemsPerPage) {
        if (totalItems === 0) {
            return 0;
        }
        if (totalItems <= itemsPerPage) {
            return 1;
        }
        const pages = Math.floor(totalItems / itemsPerPage) +1;
        return pages;
    }

    static fromTrefleResponse(response) {
        const plantsResponse = new PlantsResponse();
        plantsResponse.data = response.data.map(plantData => PlantResponse.fromTrefleResponse(plantData));
        plantsResponse.lastPage = this.calculatePages(response.meta.total, TREFLE_PER_PAGE);
        plantsResponse.perPage = TREFLE_PER_PAGE;
        plantsResponse.total = response.meta.total;
        return plantsResponse;
    }

    static fromPerenualResponse(response) {
        const plantsResponse = new PlantsResponse();
        plantsResponse.data = response.data.map(plantData => PlantResponse.fromPerenualResponse(plantData));
        plantsResponse.lastPage = response.last_page;
        plantsResponse.perPage = response.per_page;
        plantsResponse.total = response.total;
        return plantsResponse;
    }

    static fromDbResponse(plants, totalDocuments) {
        const plantsResponse = new PlantsResponse();
        plantsResponse.data = plants;
        plantsResponse.lastPage = this.calculatePages(totalDocuments, UI_PER_PAGE);
        plantsResponse.perPage = UI_PER_PAGE;
        plantsResponse.total = totalDocuments;
        return plantsResponse;
    }
}

module.exports = PlantsResponse;