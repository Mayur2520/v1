const logger = require('./loggerConfig');

exports.writeLogs = function (details,loglvl) {

    var logtme = new Date();
    
    if (loglvl == 'info'){
        logger.lo.info(logtme+'['+details.path+'-Line: '+details.line+']-'+JSON.stringify(details.message));
    }
    if (loglvl == 'error') {
        logger.error(logtme+'['+details.path+'-Line: '+details.line+']-'+JSON.stringify(details.message));
    }
    else {
        logger.info(logtme+'['+details.path+'-Line: '+details.line+']-'+JSON.stringify(details.message));
     }
};