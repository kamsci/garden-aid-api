'use strict';

class PlantResponse {
    constructor() {
        this.imageUrls = {};
    }

    static fromTrefleResponse(plantData) {
        const plantResponse = new PlantResponse();
        plantResponse.refId = plantData.id
        plantResponse.imageUrls.defaultlUrl = plantData.image_url || ''
        plantResponse.commonName = plantData.common_name
        plantResponse.scientificName = plantData.scientific_name
        return plantResponse;
    }

    static fromPerenualResponse(plantData) {
        const plantResponse = new PlantResponse();
        plantResponse.refId = plantData.id
        if (plantData.default_image){
            plantResponse.imageUrls.defaultlUrl = plantData.default_image.regular_url
            plantResponse.imageUrls.smallUrl = plantData.default_image.small_url
            plantResponse.imageUrls.thumbnailUrl = plantData.default_image && plantData.default_image.thumbnail
        } else {
            plantResponse.imageUrls.defaultlUrl = '';
        }
        plantResponse.commonName = plantData.common_name
        plantResponse.scientificName = plantData.scientific_name[0]
        return plantResponse;
    }

}

module.exports = PlantResponse;