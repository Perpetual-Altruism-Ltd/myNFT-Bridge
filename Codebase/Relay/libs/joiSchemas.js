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
    }),
    initMigration: Joi.object({
        migrationData: Joi.object({
            originUniverse: Joi.string().required(),
            originWorld: Joi.string().required(),
            originTokenId: Joi.number().required(),
            originOwner: Joi.string().required(),
            destinationUniverse: Joi.string().required(),
            destinationWorld: Joi.string().required(),
            destinationTokenId: Joi.number().required(),
            destinationOwner: Joi.string().required()
        }).required(),
        redeem: Joi.bool().required(),
        operatorHash: Joi.string().required(),
    }),
    continueMigration: Joi.object({
        migrationId: Joi.string().required(),
        migrationHashSignature: Joi.string().required()
    }),
    pollingMigration: Joi.object({
        migrationId: Joi.string().required(),
    }),
    pollingEscrow: Joi.object({
        migrationId: Joi.string().required(),
    }),
    closeMigration: Joi.object({
        migrationId: Joi.string().required(),
        escrowHashSignature: Joi.string().required()
    }),
    closeRedeemMigration: Joi.object({
        migrationId: Joi.string().required(),
        escrowHashSignature: Joi.string().required()
    }),
    pollingEndMigration: Joi.object({
        migrationId: Joi.string().required(),
    }),
    cancelMigration: Joi.object({
        migrationId: Joi.string().required(),
    }),
    getTokenUri: Joi.object({
        universe: Joi.string().required(),
        world: Joi.string().required(),
        tokenId: Joi.number().required(),
    })
}

module.exports = schemas
