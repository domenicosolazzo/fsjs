(function(context){
    var that = context;
    var storageType = {};
    var storageInfo = null;
    var fsapi = {};
    var sleep = function sleep(sec){
        setTimeout(function(){return;},sec);
    };
    /**
     * Check if webkitStorageInfo is present for the current browser
     */
    var checkApiIsAvailable = function(){
        if(!context.webkitStorageInfo) fsapi=null;
        storageInfo = context.webkitStorageInfo;
        storageType = {"PERSISTENT":storageInfo.PERSISTENT, "TEMPORARY":storageInfo.TEMPORARY}
    };
    var checkQuotaType = function( quotaType ){
        if(!quotaType || !storageType.hasOwnProperty(quotaType.toUpperCase()))
            throw new Error("Quota type is invalid.");
        return true;
    };
    /**
     * Request a quota
     * @param quotaType It can be PERSISTENT or TEMPORARY
     * @param size An integer. It is greater or equals to 0. Infinity is not accepted.
     * @param successCallback A callback function
     * @param errorCallback A callback function
     * @exception If quotaType is not valid.
     * @exception if size is lower than 0 or Infinity
     * @exception if successCallback is not a function
     * @exception if errorCallback is not a function
     * @return true, if the request is successful
     */
    var requestQuota = function requestQuota( quotaType, size, successCallback, errorCallback ){
        checkQuotaType( quotaType );
        
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
    /**
     * To query the current storage usage and quota of an application
     * @param quotaType iT can be PERSISTENT or TEMPORARY
     * @return an object literal containing both data and error information.
     * The object literal has the following format:
     *      result = {data:{quota:[value], usage:[value]}, error:[msg | null ]}
     */
    var queryUsageAndQuota = function queryUsageAndQuota( quotaType, queryUsageAndQuotaSuccess, queryUsageAndQuotaError ){
        checkQuotaType( quotaType );
        var data = {quota:null, usage:null};
        var error = {error:null};
        var metadata = {completed:0};
        var result = {data:data, error:error, metadata:metadata};
        var successCallback = function successCallback(usage, quota){
            result.data["usage"] = usage;
            result.data["quota"] = quota;
            result.metadata["completed"] = 1;
            if(typeof(queryUsageAndQuotaSuccess) === "function"){
                queryUsageAndQuotaSuccess.apply(context,[]);
            }
        };
        var errorCallback = function errorCallback( e ){
            result.error = e;
            result.metadata["completed"] = 1;
            if(typeof(queryUsageAndQuotaError) === "function"){
                queryUsageAndQuotaError.apply(context,[]);
            }
        };
        var isCompleted = function isCompleted(){

            return result.metadata.completed;
        };
        try{
            storageInfo.queryUsageAndQuota(quotaType, successCallback, errorCallback);
        }catch(error){
            result.error = error;
        }

        return result;
    };

    checkApiIsAvailable();
    fsapi.requestQuota = requestQuota;
    fsapi.queryUsageAndQuota = queryUsageAndQuota;
    if (fsapi){
        that.fsapi = fsapi;
    }
})(this);
