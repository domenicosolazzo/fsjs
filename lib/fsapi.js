(function(context){

    var outsideContext = context;
    var storageType = {};
    //File System entry point
    var fileSystem = null;

    var directories = [];
    var fileEntries = {};
    /**
     * Config information
     */
    var config = {
        "StorageInfo":false,
        "RequestFileSystem":false,
        "BlobBuilder": false,
        "ResolveLocalFileSystemURL":false,
        "URL":false,
        "CanIUseIt":true
    };
    /**
     * Check if the API are available for the current context
     */
    var checkApiIsAvailable = function(){
        config["StorageInfo"] = !!(outsideContext.storageInfo || outsideContext.webkitStorageInfo);
        config["RequestFileSystem"] = !!(outsideContext.requestFileSystem || outsideContext.webkitRequestFileSystem);
        config["BlobBuilder"] = !!(outsideContext.BlobBuilder || outsideContext.WebKitBlobBuilder || outsideContext.MozBlobBuilder);
        config["ResolveLocalFileSystemURL"] = !!(outsideContext.resolveLocalFileSystemURL || outsideContext.webkitResolveLocalFileSystemURL);
        config["URL"] = !!(outsideContext.URL || outsideContext.webkitURL);
        for (var i in config){
            if(config.hasOwnProperty(i) && config[i] === false){
                //I cannot use the following library.
                config["CanIUseIt"] = false;
                break;
            }
        }

    };

    /**
     * Check if the quota type is valid
     * @param quotaType The quotaType. Valid values: PERSISTENT, TEMPORARY
     * @return true, if the quota type is valid, false otherwise.
     */
    var checkQuotaType = function( quotaType ){
        if(!quotaType || !storageType.hasOwnProperty( quotaType.toUpperCase() ) )
            return false;
        return true;
    };
    /**
     * Check if the quota size is valid.
     * @param quotaSize The quota size. It must be a number between 0 and Infinity - 1
     * @return true if the quota size is valid, false otherwise.
     */
    var checkQuotaSize = function( quotaSize ){
        var parsedSize = parseFloat(quotaSize);
        if(isNaN(parsedSize) || parsedSize < 0 || parsedSize == Number.Infinity)
            return false;
        return true;
    };
    /**
     * Check if the input is a valid callback. It must be a function.
     * @param callback The callback
     * @return true if the callback is a function, false otherwise.
     */
    var isValidCallback = function( callback ){
        var result = typeof( callback ) === "function" ? true : false;
        return result;
    };
    /**
     * Pack the response for the caller
     * @param data The data
     * @param error The error
     * @param metadata Additional information
     */
    var packResponse = function packResponse( data, error, metadata ){
        return {data:data, error:error, metadata:metadata};
    };
    /**
     * Generate the response object for files and directories
     * @param entry A file entry or directory.
     * @return the response object
     */
    var generateResponseEntry = function generateResponseEntry( entry ){
        var entryType = entry.isFile ? "File" : (entry.isDirectory ? "Directory" : "Unknown");
        
        var responseEntry =  {
            url:toURL(entry),
            type:entryType,
            name: entry.name,
            fullPath: entry.fullPath
        };
        return responseEntry;
    };
    /**
     * Request a quota
     * @param quotaType It can be PERSISTENT or TEMPORARY
     * @param size An integer. It is greater or equals to 0. Infinity is not accepted.
     * @param successCallback A callback function
     * @param errorCallback A callback function
     * @exception If quotaType is not valid.
     * @exception if size is lower than 0 or Infinity
     * @exception if callback is not a function
     * @return an object literal, if the request is successful
     */
    var requestQuota = function requestQuota( quotaType, size, callback ){
        
        var isValidType = checkQuotaType( quotaType );
        if( !isValidType ) throw new Error(" The quota type is not valid.");

        var isValidSize = checkQuotaSize( size );
        if( !isValidSize ) throw new Error(" The quota size is not valid.");

        var parsedSize = parseFloat( size );
        var response = packResponse({bytes:-1}, null, {success:0});

        var errorCallback = function errorCallback( error ){
            response.error = error;
        };
        var successCallback = function( bytes ){

            response.data.bytes = bytes;
            response.metadata.success = 1;
        }

        outsideContext.storageInfo.requestQuota(storageType[quotaType.toUpperCase()], parsedSize*1024*1024, successCallback, errorCallback);
        isValidCallback( callback ) ? callback.apply(outsideContext, [response]): null;
        return response;
    };
    /**
     * To query the current storage usage and quota of an application
     * @param quotaType iT can be PERSISTENT or TEMPORARY
     * @param callback A callback function
     * @return an object literal containing both data and error information.
     * The object literal has the following format:
     *      response = {data:{quota:[value], usage:[value]}, error:[msg | null ], metadata:{success:[0 | 1]}}
     */
    var queryUsageAndQuota = function queryUsageAndQuota( quotaType, callback ){
        var isValidType = checkQuotaType( quotaType );
        if( !isValidType ) throw new Error(" The quota type is not valid.");

        var response = packResponse({usage:-1, quota:-1}, null, {success:0});
        // Error callback
        var errorCallback = function errorCallback( error ){
            response.error = error;
        };
        //Success callback
        var successCallback = function( usage, quota ){
            response.data.usage = usage;
            response.data.quota = quota;
            response.metadata.success = 1;
        }

        outsideContext.storageInfo.queryUsageAndQuota(quotaType, successCallback, errorCallback);
        isValidCallback( callback ) ? callback.apply(outsideContext, [response]): null;
        return response;
    };
    /**
     * Request the filesystem. This call is async, please use setTimeout(func(){..},timeout} to get the right data.
     * @param quotaType The type of filesystem (TEMPORARY | PERSISTENT)
     * @param quotaSize The amount of space for the filesystem
     * @exception if the quota type is invalid
     * @exception if the quota size is invalid
     * @return an object literal containing both data and error information.
     * The object literal has the following format:
     *      result = {data:{"name":"filesystem name"}},metadata:{success:[0|1]} error:[msg | null ]}
     */
    var requestFileSystem = function requestFileSystem( quotaType, quotaSize, callback){
        var isValidType = checkQuotaType( quotaType );
        if( !isValidType ) throw new Error(" The quota type is not valid.");

        var isValidSize = checkQuotaSize( quotaSize );
        if( !isValidSize ) throw new Error(" The quota size is not valid.");

        var parsedSize = parseFloat( quotaSize );
        var response = packResponse({name:""}, null, {success:0});

        var errorCallback = function errorCallback( error ){
            response.error = error;
            isValidCallback( callback ) ? callback.apply(outsideContext, [response]): null;
        };
        var successCallback = function( onFS ){
            response.data.name = onFS.name;
            response.metadata.success = 1;
            //Reference to the filesystem
            fileSystem = onFS;
            fileEntries[getFS().fullPath] = getFS();
            isValidCallback( callback ) ? callback.apply(outsideContext, [response]): null;
        }

        if (quotaType.toUpperCase() == "PERSISTENT"){
            // PERSISTENT FILESYSTEM
            var requestQuotaCallback = function( response ){
                outsideContext.requestFileSystem( quotaType, quotaSize, successCallback, errorCallback);
            }
            requestQuota( quotaType, quotaSize, requestQuotaCallback);
        }else{
            // TEMPORARY FILESYSTEM
            outsideContext.requestFileSystem( quotaType, quotaSize, successCallback, errorCallback);
        }

        return response;
    };
    /**
     * Retrieve the filesystem reference.
     * @exception if the filesystem does not exist.
     * @return the filesystem reference
     */
    var getFS = function getFS( ){
        if(fileSystem){
            return fileSystem.root;
        }
        throw Error("The filesystem does not exist");
    };
    /**
     * Read the entries given a reader
     * @scope Private
     * @param reader The reader
     * @param responseMsg The response message
     * @param callback A callback function
     */
    var readEntries = function( reader, responseMsg,  callback ){
        reader.readEntries( function( results ){
            if ( results.length ){
                var entries = toArray( results );
                directories = directories.concat( entries );
                readEntries( reader, responseMsg, callback );
            }else{
                 //Insert the root
                var fsReference = getFS();
                directories.unshift(fsReference);
                
                if ( directories.length ){
                    directories.forEach( function( entry, i ){
                        fileEntries[entry.fullPath] = entry;
                        var responseEntry =  generateResponseEntry( entry );
                        responseMsg.data.entries.push( responseEntry );
                    });
                }
                //Success
                responseMsg.metadata.success = 1;
                callback.apply(context,[responseMsg]);
            }

        }, function(error){
            response.error = error;
        });
    };
    /**
     * List the entries in the file system
     * @scope Public
     * @param callback A callback function
     * @exception if the filesystem does not exist.
     * @return an object literal with the response information
     */
    var listEntries = function listEntries( callback ){
        var reader = getFS().createReader();
        var response = packResponse({entries:[]}, null, {success:0});
        readEntries( reader, response, callback );
        return response;
    };
    /**
     * Helper function for transform a given list in an array.
     * @scope Private
     * @param list The input list
     * @return an array
     */
    var toArray = function toArray( list ){
        return Array.prototype.slice.call(list || [], 0);
    }
    /**
     * Create directories
     * @scope Public
     * @param parentDirName The parent directory
     * @param folders The folders to add ("domenico", "domenico/folder2", ...)
     */
    var createDirectory = function createDirectory(parentDirName, folders, callback) {
        var parentDirectory = fileEntries[parentDirName];
        if ( !parentDirectory ) throw Error("Parent directory does not exist.");
        if ( !parentDirectory.isDirectory ) throw Error(parentDirName + " is not a directory.");
        var response = packResponse({entries:[]}, null, {success:0});
        folders = folders.split("/");
        generateDirectories( parentDirectory, folders, response, callback );
        return response;
    }
    /**
     * Generate the directories given a directory entry and a list of directories to be added
     * @scope Private
     * @param parentDirectory The parent directory entry
     * @param folders A list of directory
     * @param responseMsg The response message
     * @param callback A callback function
     */
    var generateDirectories = function generateDirectories( parentDirectory, folders, responseMsg, callback){

        // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
        if (folders[0] == '.' || folders[0] == '') {
            folders = folders.slice(1);
        }

        parentDirectory.getDirectory(folders[0], {create: true}, function(dirEntry) {
            fileEntries[dirEntry.fullPath] = dirEntry;

            // Recursively add the new subfolder (if we still have another to create).
            if (folders.length) {
                var responseEntry = generateResponseEntry( dirEntry );
                responseMsg.data.entries.push( responseEntry );
            // Use the the created directory as the new parentDir. Process next path.
                generateDirectories( dirEntry, folders.slice(1), responseMsg, callback);
            }else{
                responseMsg.metadata.success = 1;
                callback.apply(outsideContext, [responseMsg]);
            }
        }, function( error ){
            responseMsg.error = error;
        });
    };

    /**
     * Remove a directory
     * @param dirName The name of the directory
     * @param recursively True if you want to delete all the content inside the folder, false otherwise.
     * @param callback A success callback.
     */
    var removeDirectory = function removeDirectory(dirName, callback, recursively){
        var response = packResponse({entries:[]}, null, {success:0});


        var successCallback = function successCallback (){
            delete fileEntries[dirName];
            response.data.entries.push(responseEntry);
            response.metadata.success = 1;
            callback.apply(outsideContext, [response]);
        };

        var errorCallback = function errorCallback ( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };


        var directory = fileEntries[dirName];

        if (!directory){
            errorCallback.apply( outsideContext, [{code:-1, msg:"The directory does not exist!"}]);
            return;
        }
        if ( !directory.isDirectory ){
            errorCallback.apply( outsideContext, [{code:-1, msg:""+dirName + " is not a directory."}]);
            return;
        }
        var responseEntry = generateResponseEntry( directory );
        var method = "remove";
        if(recursively && recursively === true){
            method = "removeRecursively";
        }
        directory[method](successCallback, errorCallback);
        return response;
    };
    /**
     * Retrieve a directory
     * @param dirName The directory name
     * @param callback A callback function
     * @return an object literal containing the response
     */
    var getDirectory = function getDirectory(dirName, callback){
        var directory = fileEntries[dirName];
        
        var response = packResponse({entries:[]}, null, {success:0});
        var successCallback = function successCallback( dirEntry ){
            response.metadata.success = 1;
            response.data.entries.push(generateResponseEntry(dirEntry));
            if( !directory )
                fileEntries[dirName] = dirEntry;
            
            callback.apply(outsideContext, [response]);
        };

        var errorCallback = function( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };
        if( directory ){
            successCallback.apply(outsideContext, [directory]);
            
        }else{
            try{
                getFS().getDirectory(dirName, {}, successCallback, errorCallback);
            }catch(e){
                errorCallback.apply(outsideContext, [e]);
            }

        }
        return response;
    };
    /**
     * Create a file
     * @param fileName A filename
     * @param callback A callback function
     */
    var createFile = function( fileName, callback ){

        var fileEntry = fileEntries[fileName];
        var response = packResponse({entries:[]}, null, {success:0});

        var successCallback = function successCallback( entry ){
            if (!fileEntry)
                fileEntries[entry.fullPath] = entry;
            response.data.entries.push( generateResponseEntry( entry ) );
            response.metadata.success = 1;
            callback.apply( outsideContext, [response] );
        };

        var errorCallback = function errorCallback( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };

        if( fileEntry ){
            successCallback.apply( outsideContext, [fileEntry] );
        }else{
            var fileNameParts = fileName.split('/');
            // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
            if (fileNameParts[0] == '.' || fileNameParts[0] == '') {
                fileNameParts = fileNameParts.slice(1);
            }
            if (fileNameParts.length <= 1){
                getFS().getFile( fileName, {create:true, exclusive:true}, successCallback, errorCallback);
            }else{
                //Create before the directories and then the file...
                var name = fileNameParts.pop();

                createDirectory("/", fileNameParts.join("/"), function( response ){
                    setTimeout(function(){
                        if (response.metadata.success === 1){
                            getFS().getFile( fileName, {create:true, exclusive:true}, successCallback, errorCallback);
                        }else{
                            errorCallback.apply( outsideContext, [{code:-1, msg:"Error creating the folder"}]);
                        }
                    },20);

                } );
            }

        }

        return response;
    };
    /**
     * Get a file
     * @param fileName The filename
     * @param callback A callback function
     */
    var getFile = function getFile( fileName, callback ){
        var fileEntry = fileEntries[fileName];
        var response = packResponse({entries:[]}, null, {success:0});

        var successCallback = function successCallback( entry ){
            if (!fileEntry)
                fileEntries[entry.fullPath] = entry;
            response.data.entries.push( generateResponseEntry( entry ) );
            response.metadata.success = 1;
            callback.apply( outsideContext, [response] );
        };

        var errorCallback = function errorCallback( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };

        if( fileEntry ){
            successCallback.apply( outsideContext, [fileEntry] );
        }else{
            getFS().getFile( fileName, {}, successCallback, errorCallback);
        }

        return response;
    };
    /**
     * Remove a file
     * @param fileName The filename
     * @param callback A callback function
     */
    var removeFile = function removeFile( fileName, callback ){
        var fileEntry = fileEntries[fileName];
        var response = packResponse({entries:[]}, null, {success:0});
        
        var successCallback = function successCallback( ){
            delete fileEntries[fileName];
            response.metadata.success = 1;
            callback.apply( outsideContext, [response] );
        };

        var errorCallback = function errorCallback( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };
        if( fileEntry ){
            fileEntry.remove( successCallback, errorCallback );
        }else{
            errorCallback.apply( outsideContext, [{code:-1, msg:"The file does not exist."}] );
        }

        return response;
    };

    /**
     * Copy a src into the destination
     * @param src The source
     * @param dest The destination
     * @param callback A callback function
     */
    var copy = function copy( src, dest, callback ){
        var srcEntry = fileEntries[src];
        var destEntry = fileEntries[dest];
        __copyTo( srcEntry, destEntry, null, callback );
    };
    /**
     * Duplicate a source
     * @param src The source
     * @param newName A new name or null
     * @param callback A callback function
     */
    var duplicate = function duplicate( src, newName, callback ){
        var srcEntry = fileEntries[src];

        var errorCallback = function errorCallback ( error ){
           callback.apply(outsideContext, [packResponse({entries:null}, error, {success:0})]);
        };

        var successCallback = function successCallback ( destEntry ){
            var srcName = src.split("/");

            var name = newName || "duplicate_"+ Math.floor(Math.random() * 100000) + "_"+ +new Date()+"_"+srcName.pop();
            __copyTo( srcEntry, destEntry, name, callback );
        };
        if ( !srcEntry ){
            errorCallback.apply( outsideContext, [{code:-1, msg:"The source entry does not exist."}]);
            return;
        }
        srcEntry.getParent( successCallback, errorCallback);
    };

    /**
     * Copy a source
     * @scope Private
     * @param srcEntry The source entry
     * @param destEntry The destination entry
     * @param opt_newName The optional name
     * @param callback A callback function
     */
    var __copyTo = function __copyTo(srcEntry, destEntry, opt_newName, callback ) {
        var newName = opt_newName || null;

        var response = packResponse({entries:[]}, null, {success:0});

        var successCallback = function successCallback( entry ){
            response.metadata.success = 1;
            response.data.entries.push( generateResponseEntry( entry ) );
            callback.apply(outsideContext, [response]);
        };

        var errorCallback = function erroCallback( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };
        if (!srcEntry || !destEntry || !srcEntry["copyTo"]){
            errorCallback.apply( outsideContext, [{code:-1, msg:"The entry is not valid."}]);
            return;
        }
        srcEntry.copyTo(destEntry, newName, successCallback, errorCallback );
    };
    /**
     * Move a source entry to the destination entry
     * @param src A source entry {string}
     * @param dest A destination entry {string}
     * @param callback A callback function
     */
    var move = function move( src, dest, callback){
        var srcEntry = fileEntries[src];
        var destEntry = fileEntries[dest];

        if ( srcEntry && destEntry && destEntry.isDirectory ){
            __moveTo( srcEntry, destEntry, null, callback);
        }else{
            var error = {code:-1, msg:"Error moving the file"};
            callback.apply(outsideContext, [packResponse({entries:[]}, error, {success:0})]);
        }
    };
    /**
     * Rename a source entry
     * @param src The source entry
     * @param name The new name
     * @param callback A callback function
     */
    var rename = function rename( src, name, callback){
        var srcEntry = fileEntries[src];
        var destEntry = getFS();
        if ( srcEntry && destEntry && destEntry.isDirectory && name ){
            __moveTo( srcEntry, destEntry, name, callback);
        }else{
            var error = {code:-1, msg:"Error moving the file"};
            callback.apply(outsideContext, [packResponse({entries:[]}, error, {success:0})]);
        }
    };
    /**
     * Move a source
     * @scope Private
     * @param srcEntry The source entry
     * @param destEntry The destination entry
     * @param opt_newName The optional name
     * @param callback A callback function
     */
    var __moveTo = function __moveTo(srcEntry, destEntry, opt_newName, callback) {
        var newName = opt_newName || null;
        var response = packResponse({entries:[]}, null, {success:0});

        var successCallback = function successCallback( entry ){
            response.metadata.success = 1;
            response.data.entries.push( generateResponseEntry( entry ) );
            callback.apply(outsideContext, [response]);
        };

        var errorCallback = function errorCallback( error ){
            response.error = error;
            callback.apply(outsideContext, [response]);
        };

        if (!srcEntry || !destEntry || !srcEntry["moveTo"]){
            errorCallback.apply(outsideContext, [{code:-1, msg:"The entry is not valid."}]);
            return;
        }
        srcEntry.moveTo(destEntry, newName, successCallback, errorCallback );
    };

    /**
     * Write the file
     * @param fileName The filename of the entry
     * @param dataInput The data to write
     * @param callback A callback function
     */
    var write = function write( fileName, dataInput, callback ){
        var data = checkData( dataInput );
        var response = packResponse({}, null, {success:0});

        var successCallback = function successCallback ( fileWriter ){
            var bb = new BlobBuilder();
            bb.append(data.content);
            fileWriter.write(bb.getBlob(data.contentType));

            response.metadata.success = 1;
            callback.apply( outsideContext, [response]);
        };
        var errorCallback = function errorCallback ( error ){
            response.error = error;
            callback.apply( outsideContext, [response]);
        };

        var fileEntry = fileEntries[fileName];
        if ( !fileEntry || !fileEntry['isFile'] || !fileEntry.isFile){
            errorCallback.apply( outsideContext, [{code:-1, msg:"The file does not exist."}]);
            return;
        }
        fileEntry.createWriter( successCallback, errorCallback);
    };
    /**
     * Check the data
     * @param data
     * @return the formatted data.
     */
    var checkData = function checkData( data ){
        if( !data ) data = {content:"", contentType:"text/plain"};
        if( !(data instanceof Object) ) {
            data = {content:data, contentType:"text/plain"};
        }
        if( !data.hasOwnProperty("content")) data.content = "";
        if( !data.hasOwnProperty("contentType")) data.contentType = "text/plain";
        return data;
    };

    /**
     * Import files to a particular directory
     * @param dirName The directory name
     * @param files A list of files
     * @param callback A callback function
     */
    var importFiles = function( dirName, files, callback ){
        var response = packResponse({entries:[]}, null, {success:0});
        var directory = fileEntries[dirName];

        var errorCallback = function ( error ){
            response.error = error;
        };
        var writeCallback = function( fileToWrite ){
            fileToWrite.createWriter( function( fileWriter ){
               fileWriter.write( fileToWrite );
               response.data.entries.push( generateResponseEntry( fileToWrite ) );
            }, errorCallback);
        };

        if (!directory){
            errorCallback.apply( outsideContext, [{code:-1,msg:"Directory is not valid"}]);
            callback.apply( outsideContext, [response]);
            return;
        }
        files.forEach(function( file, i){
            var fileName = file.name;
            if (!fileEntries[fileName]){
                directory.getFile(fileName, {create: true, exclusive: true}, writeCallback, errorCallback);
            }else{
                response.data.entries.push( generateResponseEntry( fileEntries[fileName] ) );
            }
        });

        response.metadata.success = 1;
        callback.apply(outsideContext, [response]);
    };

    /**
     * Return the url of a particular entry
     * @param entry the file entry
     * @return the url
     */
    var toURL = function( entry ){
        return entry.toURL();
    };

    /**
     * Encode the data in base64
     * @param data
     * @return the converted data
     */
    var encodeBase64 = function( data ){
        return context.btoa(data);
    };
    /**
     * Return a data url for a given entry
     * @param fileEntry the fileEntry
     * @param callback A callback function
     */
    var toDataURL = function ( fileEntry, callback ){
        var response = packResponse({url:null}, null, {success:0});

        var errorCallback = function errorCallback( error ){
            response.error = error;
            callback.apply( outsideContext, [response]);
        };
        var successCallback = function successCallback ( file ){
            var reader = new FileReader();
            var dataURL = reader.readAsDataURL( file );
            reader.onload = function( e ){
                response.data.url = e.target.result;
                response.metadata.success = 1;
                callback.apply( outsideContext, [response]);
            };

        };
        if (!(fileEntry && fileEntry["isFile"] && fileEntry.isFile)){
            errorCallback.apply(outsideContext, [{code:-1, msg:"The fileEntry is not valid."}]);
            return;
        }

        fileEntry.file( successCallback, errorCallback);
    };
    /**
     * Share the data of the entry as dataURL.
     * @param fileName The filename
     * @param callback A callback function
     */
    var share = function share( fileName, callback ){
        var fileEntry = fileEntries[fileName];
        toDataURL( fileEntry, callback );
    }
    var format = function format(  ){
        var reader = getFS().createReader();
        
        var entries = [];
        var internalDelete = function internalDelete( internalReader ){
            reader.readEntries( function( results ){
                if ( results.length ){
                    var entriesArray = toArray( results );
                    entries = entries.concat( entriesArray );
                    internalDelete( internalReader );
                }else{
                     //Insert the root
                    var fsReference = getFS();
                    entries.unshift(fsReference);

                    if ( entries.length ){

                        entries.forEach( function( entry, i ){
                            console.log(entry);
                            if( entry.isFile){
                                entry.remove(function(){}, function(error){
                                    console.log(error);
                                });
                            }else{
                                entry.removeRecursively(function(){}, function(error){});
                            }
                        });
                    }

                }

            }, function(error){});
        }
        internalDelete( reader );
    }
    /**
     * Return an entry given an url
     * @param URL The url of the entry
     * @param callback A callback function
     */
    var entryFromURL = function fileFromURL(URL, callback){
        var response = packMessage({entries:[]}, null, {success:0});

        var successCallback = function successCallback( entry ){
            if ( !fileEntries[entry.fullPath] )
                fileEntries[entry.fullPath]=entry;
            response.data.entries.push( generateResponseEntry( entry ) );
            response.metadata.success = 1;
            callback.apply(context, [response]);
        };

        var errorCallback = function errorCallback( error ){
            response.error = error;
            callback.apply(context, [response]);
        };
        outsideContext.resolveLocalFileSystemURL(URL, successCallback, errorCallback);
    };
    /**
     * Returns the blob address for chrome
     */
    var chromeBlobAddress = function chromeBlobAddress(){
        return "chrome://blob-internals/";
    };
    /**
     * Initialize the library.
     * @exception if the library cannot be used in the current context.
     */
    var initialization = function initialization( ){
        checkApiIsAvailable();
        if( config["CanIsUseIt"] === false) {
            fsjs = null;
            throw new Error("The library cannot be used with the current browser.");
        }
        outsideContext.BlobBuilder = outsideContext.BlobBuilder || outsideContext.WebKitBlobBuilder || outsideContext.MozBlobBuilder;
        outsideContext.resolveLocalFileSystemURL = outsideContext.resolveLocalFileSystemURL || outsideContext.webkitResolveLocalFileSystemURL;
        outsideContext.URL = outsideContext.URL || outsideContext.webkitURL;
        outsideContext.storageInfo = outsideContext.storageInfo || outsideContext.webkitStorageInfo;
        outsideContext.requestFileSystem = outsideContext.requestFileSystem || outsideContext.webkitRequestFileSystem;

        storageType = {"PERSISTENT":outsideContext.storageInfo.PERSISTENT, "TEMPORARY":outsideContext.storageInfo.TEMPORARY}
        
    };
    //Init;
    initialization();
    var fsjs = {
        requestQuota: requestQuota,
        queryUsageAndQuota: queryUsageAndQuota,
        requestFileSystem: requestFileSystem,
        listEntries: listEntries,
        createDirectory: createDirectory,
        removeDirectory : removeDirectory,
        getDirectory: getDirectory,
        createFile: createFile,
        getFile: getFile,
        removeFile: removeFile,
        move: move,
        copy: copy,
        rename: rename,
        duplicate: duplicate,
        write:write,
        share:share,
        format:format
    };

    outsideContext.fsjs = fsjs;
})(this);
