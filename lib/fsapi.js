(function(context){
    var that = context;
    var storageType = {};
    var storageInfo = null;
    var fsapi = {};
    /**
     * Check if webkitStorageInfo is present for the current browser
     */
    var checkApiIsAvailable = function(){
        if(!context.webkitStorageInfo) fsapi=null;
        storageInfo = context.webkitStorageInfo;
        storageType = {"PERSISTENT":storageInfo.PERSISTENT, "TEMPORARY":storageInfo.TEMPORARY}
    };
    /**
     * Request a quota
     * @param quotaType It can be PERSISTENT or TEMPORARY
     * @param size An integer. It is greater or equals to 0. Infinity is not accepted.
     * @param successCallback A callback function
     * @param errorCallback A callback function
     */
    var requestQuota = function(quotaType, size, successCallback, errorCallback){
        if(!quotaType || !storageType.hasOwnProperty(quotaType.toUpperCase()))
            throw new Error("Quota type is invalid.");
        var parsedSize = parseFloat(size);
        if(isNaN(parsedSize) || parsedSize < 0 || parsedSize == Number.Infinity)
            throw new Error("Size is not valid.");
        if(typeof(successCallback) != "function")
            throw new Error("The successCallback is not a function.");
        if(typeof(errorCallback) != "function")
            throw new Error("The errorCallback is not a function.");

        storageInfo.requestQuota(storageType[quotaType.toUpperCase()], parsedSize*1024*1024, successCallback, errorCallback);
        return true;
    };
    
    checkApiIsAvailable();

    fsapi.requestQuota = requestQuota;
    if (fsapi){
        that.fsapi = fsapi;
    }
})(this);
