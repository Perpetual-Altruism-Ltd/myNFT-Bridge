const Joi = require('joi');

const schemas = {
    getContracts: Joi.object({ universeUniqueId: Joi.string().required() }),
    waitForOperatorElevation: Joi.object({ 
        clientId: Joi.string().required(),
        universeUniqueId: Joi.string().required(),
        contract: Joi.string().required(),
        tokenId: Joi.string().required()
    }),
    getAvailableWorlds: Joi.object({ universe: Joi.string().required() }),
    getAvailableTokenId: Joi.object({
        universe: Joi.string().required(),
        world: Joi.string().required()
    })
}

module.exports = schemas