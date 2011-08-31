
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

// below are some general tests but feel free to delete them.

module("Environment");
// these test things from plugins.js
test("Environment is good",function(){
  expect(4);
  ok( !!window.log, "log function present");

  var history = log.history && log.history.length || 0;
  log("logging from the test suite.")
  equals( log.history.length - history, 1, "log history keeps track" )

  ok( !!window.Modernizr, "Modernizr global is present")

  //Check the fsjs library
  ok( !!window.fsjs, "FileSystem API is present");
})
module("FileSystem API");
test("Check fsjs methods", function(){
    expect(16);
    //Check the requestQuota method
    ok(!!window.fsjs.requestQuota, "RequestQuota method is present.");
    ok(!!window.fsjs.queryUsageAndQuota, "QueryUsageAndQuota method is present.");
    ok(!!window.fsjs.requestFileSystem, "requestFileSystem method is present.");
    ok(!!window.fsjs.listEntries, "listDirectories method is present.");
    ok(!!window.fsjs.createDirectory, "createDirectory method is present.");
    ok(!!window.fsjs.removeDirectory, "removeDirectory method is present.");
    ok(!!window.fsjs.getDirectory, "getDirectory method is present.");
    ok(!!window.fsjs.createFile, "createFile method is present.");
    ok(!!window.fsjs.getFile, "getFile method is present.");
    ok(!!window.fsjs.removeFile, "removeFile method is present.");
    ok(!!window.fsjs.copy, "copy method is present.");
    ok(!!window.fsjs.duplicate, "duplicate method is present.");
    ok(!!window.fsjs.rename, "rename method is present.");
    ok(!!window.fsjs.move, "duplicate method is present.");
    ok(!!window.fsjs.share, "share method is present.");
    ok(!!window.fsjs.removeAll, "removeAll method is present.");
});
//Timeout
this.timeoutTime = 40;
module("Request Quota");
test("Quota type is invalid", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(2);
    
    raises(function(){
        requestQuota("not valid", 2, function( response ){});
    }, Error, "The quota type is invalid");

    raises(function(){
        requestQuota("", 2, function( response ){});
    }, Error, "The quota type is invalid");
});

test("Quota type is valid", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(1);

    stop();
    requestQuota("TEMPORARY", 2, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota type is valid(TEMPORARY)");
                start();
            }
        ,this.timeoutTime);
    });
});

test("Size is invalid", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(3);

    raises(function(){
        requestQuota("TEMPORARY", "", function( response ){});
    }, Error, "The size is invalid(not integer)");

    raises(function(){
        requestQuota("TEMPORARY", -1, function( response ){});
    }, Error, "The size is lower than 0");
    
    raises(function(){
        requestQuota("TEMPORARY", Number.Infinity, function( response ){});
    }, Error, "The size is Infinity");
});

test("Quota size is valid (0) ", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(1);

    stop();
    requestQuota("TEMPORARY", 0, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota size is valid(0)");
                start();
            }
        ,this.timeoutTime);
    });
});
test("Quota size is valid ( higher than 0) ", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(1);

    stop();
    requestQuota("TEMPORARY", 2, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota size is valid ( higher than 0 )");
                start();
            }
        ,this.timeoutTime);
    });
});

test("Quota size is valid ( MAX_VALUE ) ", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(1);

    stop();
    requestQuota("TEMPORARY", Number.MAX_VALUE + 1, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota size is valid ( MAX_VALUE )");
                start();
            }
        ,10);
    });
});

test("Check the response ", function(){
    var requestQuota = window.fsjs.requestQuota;
    expect(5);

    stop();
    requestQuota("TEMPORARY", Number.MAX_VALUE + 1, function( response ){
        setTimeout(function(){
                equals(response.hasOwnProperty("data"), true, "The result contains a data key");
                equals(response.data.hasOwnProperty("bytes"), true, "Data contains a bytes key");
                equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
                equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
                equals(response.hasOwnProperty("error"), true, "The result contains an error key");
                start();
            }
        ,this.timeoutTime);
    });
});

module("QueryUsageAndQuota");
test("queryUsageAndQuota - Check the response ", function(){
    var fun = window.fsjs.queryUsageAndQuota;
    expect(6);

    stop();
    fun("TEMPORARY", function( response ){
        setTimeout(function(){
                equals(response.hasOwnProperty("data"), true, "The result contains a data key");
                equals(response.data.hasOwnProperty("usage"), true, "Data contains an usage key");
                equals(response.data.hasOwnProperty("quota"), true, "Data contains a quota key");
                equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
                equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
                equals(response.hasOwnProperty("error"), true, "The result contains an error key");
                start();
            }
        ,this.timeoutTime);
    });
});

test("Quota type is invalid", function(){
    var fun = window.fsjs.queryUsageAndQuota;
    expect(2);

    raises(function(){
        fun("not valid", function( response ){});
    }, Error, "The quota type is invalid");
    
    raises(function(){
        fun("", function( response ){});
    }, Error, "The quota type is invalid");
});

test("Quota type is valid", function(){
    var fun = window.fsjs.queryUsageAndQuota;
    expect(1);

    stop();
    fun("TEMPORARY", function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota type is valid(TEMPORARY)");
                start();
            }
        ,this.timeoutTime);
    });
});

module("RequestFileSystem");
test("Check the response ", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(5);

    stop();
    fun("TEMPORARY", 2, function( response ){
        setTimeout(function(){
                equals(response.hasOwnProperty("data"), true, "The result contains a data key");
                equals(response.data.hasOwnProperty("name"), true, "Data contains a name key");
                equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
                equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
                equals(response.hasOwnProperty("error"), true, "The result contains an error key");
                start();
            }
        ,this.timeoutTime);
    });
});

test("Quota type is invalid", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(2);

    raises(function(){
        fun("not valid", 2, function( response ){});
    }, Error, "The quota type is invalid");

    raises(function(){
        fun("", 2,  function( response ){});
    }, Error, "The quota type is invalid");
});

test("Quota type is valid", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(1);
    stop();
    fun("TEMPORARY", 2,  function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota type is valid(TEMPORARY)");
                start();
            }
        ,this.timeoutTime);
    });
});

test("Quota size is valid (0) ", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(1);

    stop();
    fun("TEMPORARY", 0, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota size is valid(0)");
                start();
            }
        ,this.timeoutTime);
    });
});
test("Quota size is valid ( higher than 0) ", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(1);

    stop();
    fun("TEMPORARY", 2, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota size is valid ( higher than 0 )");
                start();
            }
        ,this.timeoutTime);
    });
});
test("Quota size is valid ( MAX_VALUE ) ", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(1);

    stop();
    fun("TEMPORARY", Number.MAX_VALUE + 1, function( response ){
        setTimeout(function(){
                equals(response.metadata.success, 1, "The quota size is valid ( MAX_VALUE )");
                start();
            }
        ,this.timeoutTime);
    });
});

test("Size is invalid", function(){
    var fun = window.fsjs.requestFileSystem;
    expect(3);

    raises(function(){
        fun("TEMPORARY", "", function( response ){});
    }, Error, "The size is invalid(not integer)");

    raises(function(){
        fun("TEMPORARY", -1, function( response ){});
    }, Error, "The size is lower than 0");

    raises(function(){
        fun("TEMPORARY", Number.Infinity, function( response ){});
    }, Error, "The size is Infinity");
});

module("ListEntries")
test("listEntries - Check the response ", function(){
    var fun = window.fsjs.listEntries;
    expect(6);

    stop();
    fun(function( response ){
        setTimeout(function(){
            equals(response.hasOwnProperty("data"), true, "The result contains a data key");
            equals(response.data.hasOwnProperty("entries"), true, "Data contains an entries key");
            equals(typeof(response.data.entries), typeof([]), "Entries is an array");
            equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
            equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
            equals(response.hasOwnProperty("error"), true, "The result contains an error key");
            start();
        }, this.timeoutTime);

    });
});

test("listEntries - Success ", function(){
    var fun = window.fsjs.listEntries;
    expect(1);

    stop();
    fun(function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 1, "List entries has been executed.");
            start();
        }, this.timeoutTime);

    });
});
module("Create Directory", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});

test("Check the response ", function(){
    var fun = window.fsjs.createDirectory;
    expect(6);
    stop();
    var timestamp = +new Date();
    var testName = "test_" + Math.floor(Math.random()*100000000)+"_"+timestamp;

    fun("/", testName, function( response ){
        setTimeout(function(){
            
            equals(response.hasOwnProperty("data"), true, "The result contains a data key");
            equals(response.data.hasOwnProperty("entries"), true, "Data contains an entries key");
            equals(typeof(response.data.entries), typeof([]), "Entries is an array");
            equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
            equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
            equals(response.hasOwnProperty("error"), true, "The result contains an error key");
            start();
        }, this.timeoutTime);

    });
});

test("Generate multiple folders ", function(){
    var fun = window.fsjs.createDirectory;
    expect(6);

    stop();
    var timestamp = +new Date();
    var testName = "test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+"/test1/test2/test3";

    fun("/", testName, function( response ){
        setTimeout(function(){
            equals(response.hasOwnProperty("data"), true, "The result contains a data key");
            equals(response.data.hasOwnProperty("entries"), true, "Data contains an entries key");
            equals(typeof(response.data.entries), typeof([]), "Entries is an array");
            equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
            equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
            equals(response.hasOwnProperty("error"), true, "The result contains an error key");
            start();
        }, this.timeoutTime);

    });
});


test("Parent directory is invalid: It does not exist ", function(){
    var fun = window.fsjs.createDirectory;
    
    var timestamp = +new Date();
    var testName = "test";

    raises(function(){
        fun("/doesnotexist", testName, function( response ){});
    }, Error, "The parent directory (first parameter) does not exist.");
});

module("Remove Directory", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("Remove a directory ", function(){
    var fun = window.fsjs.removeDirectory;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+"/test1/test2/test3";

    window.fsjs.createDirectory("/", testName, function( response ){

        setTimeout(function(){
            fun(testName, function( responseRemove ){
                equals(responseRemove.metadata.success, 1, "The directory has been removed.");
                start();
            } );

        }, this.timeoutTime);

    });
});

test("Directory does not exist ", function(){
    var fun = window.fsjs.removeDirectory;

    expect(1);
    stop();
    fun("/testToDelete", function( response ){
        setTimeout(function( ){
            equals(response.metadata.success, 0, "The directory does not exist");
            start();
        },this.timeoutTime);
    }, 0);
});

test("Check the response ", function(){
    var fun = window.fsjs.removeDirectory;
    expect(6);

    stop();
    var timestamp = +new Date();
    var testName = "/test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+"/test1/test2/test3";

    window.fsjs.createDirectory("/", testName, function( response ){

        setTimeout(function(){
            fun(testName, function( responseRemove ){
                equals(response.hasOwnProperty("data"), true, "The result contains a data key");
                equals(response.data.hasOwnProperty("entries"), true, "Data contains an entries key");
                equals(typeof(response.data.entries), typeof([]), "Entries is an array");
                equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
                equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
                equals(response.hasOwnProperty("error"), true, "The result contains an error key");
                start();
            } );

        }, this.timeoutTime);

    });
});

module("Get Directory", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});

test("Get a directory ", function(){
    var fun = window.fsjs.getDirectory;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+"/test1/test2/test3";

    window.fsjs.createDirectory("/", testName, function( response ){
        fun(testName, function( responseGet ){
            equals(responseGet.metadata.success, 1, "The directory has been removed.");
            start();
        } );
    });
});

test("Directory does not exist ", function(){
    var fun = window.fsjs.getDirectory;
    expect(1);

    stop();
    var testName = "/testFail";
    fun(testName, function( responseGet ){
        equals(responseGet.metadata.success, 0, "The directory does not exist.");
        start();
    } );
});

test("Check the response ", function(){
    var fun = window.fsjs.getDirectory;
    expect(6);

    stop();
    fun("/", function( response ){
        equals(response.hasOwnProperty("data"), true, "The result contains a data key");
        equals(response.data.hasOwnProperty("entries"), true, "Data contains an entries key");
        equals(typeof(response.data.entries), typeof([]), "Entries is an array");
        equals(response.hasOwnProperty("metadata"), true, "The result contains a metadata key");
        equals(response.metadata.hasOwnProperty("success"), true, "Metadata contains a success key");
        equals(response.hasOwnProperty("error"), true, "The result contains an error key");
        start();
    } );
});

module("Create File", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});

test("Create directories and file ", function(){
    var fun = window.fsjs.createFile;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+"/test1/test2/test3/test.txt";

    fun(testName, function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 1, "The file has been created.");
            start();
        },this.timeoutTime);
    } );
});

test("Create a file ", function(){
    var fun = window.fsjs.createFile;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+".txt";

    fun(testName, function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 1, "The file has been created.");
            start();
        },this.timeoutTime);
    } );
});

module("Get File", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});

test("File does not exist file ", function(){
    var fun = window.fsjs.getFile;
    expect(3);

    stop();
    var timestamp = +new Date();
    var testName = "/test_" + Math.floor(Math.random()*100000000)+"_"+timestamp+".txt";

    fun(testName, function( response ){
        setTimeout(function(){
            notDeepEqual(response.error, null, "The error is present")
            equals(response.error.code, 1, "The file does not exist.");
            equals(response.metadata.success, 0, "The response contains an error.");
            start();
        },this.timeoutTime);
    } );
});


test("File does not exist file ", function(){
    var fun = window.fsjs.getFile;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_getFile.txt";

    window.fsjs.createFile(testName, function( response ){});

    fun(testName, function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 1, "The file has been retrieved.");
            start();
        }, this.timeoutTime);
    });

});

module("Remove File", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("File does not exist file ", function(){
    var fun = window.fsjs.removeFile;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_removeFile_not_exist.txt";
    
    fun(testName, function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 0, "The file cannot be removed.");
            start();
        },this.timeoutTime);
    });

});


test("Remove File - File has been removed ", function(){
    var fun = window.fsjs.removeFile;
    expect(1);

    stop();
    var timestamp = +new Date();
    var testName = "/test_removeFile.txt";

    window.fsjs.createFile(testName, function( response ){

        setTimeout(function(){
            fun(testName, function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The file has been removed.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });

});

module("Copy", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});

test("Source does not exist  ", function(){
    var fun = window.fsjs.copy;
    expect(2);

    stop();
    var testSourceName = "/test_copy_file_"+ +new Date() +".txt";

    fun(testSourceName, "/", function( response ){
        setTimeout(function(){
            notDeepEqual(response.error, null, "An error has occurred.");
            equals(response.metadata.success, 0, "The source file does not exist.");
            start();
        },this.timeoutTime);
    });
});

test("Destination does not exist  ", function(){
    var fun = window.fsjs.copy;
    expect(2);

    stop();
    var testSourceName = "/test_copy_file.txt";

    window.fsjs.createFile(testSourceName, function( response ){

        setTimeout(function(){
            fun(testSourceName, "/notvalid", function( response ){
                setTimeout(function(){
                    notDeepEqual(response.error, null, "An error has occurred.");
                    equals(response.metadata.success, 0, "The source file does not exist.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });
});

test("Copying a file on itself ", function(){
    var fun = window.fsjs.copy;
    expect(2);

    stop();
    var testSourceName = "/test_"+ +new Date()+".txt";

    window.fsjs.createFile(testSourceName, function( response ){});

    setTimeout(function(){
        fun(testSourceName, "/", function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 0, "Error copying a file on itself");
                notDeepEqual(response.error, null, "An error has occurred.");
                start();
            },this.timeoutTime);
        });
    },this.timeoutTime);
});

test("Copying a source file in a destination directory  ", function(){
    var fun = window.fsjs.copy;
    expect(1);

    stop();
    var testSourceName = "/test/test_copy_file_"+ +new Date() +".txt";

    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){
            fun(testSourceName, "/", function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source file has been copied.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });
});

test("Copying a source folder in a destination directory  ", function(){
    var fun = window.fsjs.copy;
    expect(1);

    stop();
    var testSourceName = "/test/test_"+ +new Date();

    window.fsjs.createDirectory("/", testSourceName, function( response ){
        setTimeout(function(){
            fun(testSourceName, "/", function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source directory has been copied.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });


});

test("Copying a source folder in a destination directory  ", function(){
    var fun = window.fsjs.copy;
    expect(2);
    
    stop();
    var testSourceName = "/test_"+ +new Date();

    window.fsjs.createDirectory("/", testSourceName, function( response ){});

    setTimeout(function(){
        fun(testSourceName, "/", function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 0, "Error copying a directory on itself");
                notDeepEqual(response.error, null, "An error has occurred.");
                start();
            },this.timeoutTime);
        });
    },this.timeoutTime);
});

module("Duplicate", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("Duplicate a source file with a new name", function(){
    var fun = window.fsjs.duplicate;
    expect(1);
    stop();

    var timestamp = +new Date();
    var testSourceName = "/testDuplicate_"+ timestamp +".txt";
    var newName = "testDuplicate_"+timestamp+"_NEW.txt";

    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){
    
            fun(testSourceName, newName, function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source file has been duplicated.");
                    start();
                },this.timeoutTime);
            });

        },this.timeoutTime);
    });


});

test("Duplicate a source file without a new name", function(){
    var fun = window.fsjs.duplicate;
    expect(1);

    stop();

    var timestamp = +new Date();
    var testSourceName = "/testDuplicate_"+ timestamp +".txt";

    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){

            fun(testSourceName, null, function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source file has been duplicated.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });


});

test("Duplicate a source entry is invalid", function(){
    var fun = window.fsjs.duplicate;
    expect(1);

    stop();
    var testSourceName = "testSourceDoesNotExist.txt";
    fun(testSourceName, null, function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 0, "The source file does not exist.");
            start();
        },this.timeoutTime);
    });
});

test("Duplicate a source directory with a new name", function(){
    var fun = window.fsjs.duplicate;
    expect(1);
    stop();

    var timestamp = +new Date();
    var testSourceName = "/test";
    var newName = "test_duplicate_"+timestamp;

    window.fsjs.createDirectory("/", testSourceName, function( response ){});

    setTimeout(function(){
        fun(testSourceName, newName, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The source directory has been duplicated.");
                start();
            },this.timeoutTime);
        });
    },this.timeoutTime);
});


module("Move", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("Source does not exist  ", function(){
    var fun = window.fsjs.move;
    expect(2);

    stop();
    var testSourceName = "/test_move_file_"+ +new Date() +".txt";

    fun(testSourceName, "/", function( response ){
        setTimeout(function(){
            notDeepEqual(response.error, null, "An error has occurred.");
            equals(response.metadata.success, 0, "The source file does not exist.");
            start();
        },this.timeoutTime);
    });

});

test("Destination does not exist  ", function(){
    var fun = window.fsjs.move;
    expect(2);

    stop();
    var testSourceName = "/test_copy_file.txt";

    window.fsjs.createFile(testSourceName, function( response ){

        setTimeout(function(){
            fun(testSourceName, "/notvalid", function( response ){
                setTimeout(function(){
                    notDeepEqual(response.error, null, "An error has occurred.");
                    equals(response.metadata.success, 0, "The source file does not exist.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });
});


test("Moving a source file in a destination directory  ", function(){
    var fun = window.fsjs.move;
    expect(1);

    stop();
    var testSourceName = "/test/test_copy_file_"+ +new Date() +".txt";

    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){
            fun(testSourceName, "/", function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source file has been moved.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });


});

test("Moving a source folder in a destination directory  ", function(){
    var fun = window.fsjs.move;
    expect(1);

    stop();
    var testSourceName = "/test/test_"+ +new Date();

    window.fsjs.createDirectory("/", testSourceName, function( response ){
        setTimeout(function(){
            fun(testSourceName, "/", function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source directory has been moved.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });


});

test("Move - Destination is not a directory  ", function(){
    var fun = window.fsjs.move;
    expect(2);

    stop();
    var testSourceName = "/test_copy_file_"+ +new Date() +".txt";
    var notAFolder = "/notafolder_"+ +new Date() +".txt";

    window.fsjs.createFile(testSourceName, function( response ){
        window.fsjs.createFile(notAFolder, function( response ){
            fun(testSourceName, notAFolder, function( response ){
                setTimeout(function(){
                    notDeepEqual(response.error, null, "An error has occurred.");
                    equals(response.metadata.success, 0, "The source file does not exist.");
                    start();
                },this.timeoutTime);
            });
        });
    });




});

module("Rename", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("Source does not exist  ", function(){
    var fun = window.fsjs.rename;
    expect(2);

    stop();
    var testSourceName = "/test_rename_file_does_not_exists_"+ +new Date()+"_.txt";

    fun(testSourceName, "/", function( response ){
        setTimeout(function(){
            notDeepEqual(response.error, null, "An error has occurred.");
            equals(response.metadata.success, 0, "The source file does not exist.");
            start();
        },this.timeoutTime);
    });

});

test("Rename a source file ", function(){
    var fun = window.fsjs.rename;
    expect(1);
    stop();

    var testSourceName = "rename_file_"+ +new Date();
    var testNewName = testSourceName + "_renamed.txt";
    testSourceName = "/" +testSourceName + ".txt";
    
    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){
            fun(testSourceName, testNewName, function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source file has been renamed.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });


});

test("Rename a directory  ", function(){
    var fun = window.fsjs.rename;
    expect(1);
    stop();
    
    var testSourceName = "test_rename_file_does_not_exists_"+ +new Date();
    var testNewName = testSourceName + "_renamed";
    testSourceName = "/"+ testSourceName;

    window.fsjs.createDirectory("/", testSourceName, function( response ){
        setTimeout(function(){

            fun(testSourceName, testNewName, function( response ){
                setTimeout(function(){

                    equals(response.metadata.success, 1, "The source directory has been renamed.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });


});

module("Write", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("Source does not exist  ", function(){
    var fun = window.fsjs.write;
    expect(2);

    stop();
    var testSourceName = "/test_write_file_does_not_exists_"+ +new Date()+".txt";
    var data = {content:"no data", contentType:"text/plain"};

    fun(testSourceName, data, function( response ){
        setTimeout(function(){
            notDeepEqual(response.error, null, "An error has occurred.");
            equals(response.metadata.success, 0, "The source file does not exist.");
            start();
        },this.timeoutTime);
    });

});

test("Write a source file ", function(){
    var fun = window.fsjs.write;
    expect(1);

    stop();
    var testSourceName = "/test_write_file_does_not_exists_"+ +new Date()+".txt";
    var data = {content:"no data", contentType:"text/plain"};

    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){
            fun(testSourceName, data, function( response ){
                setTimeout(function(){
                    equals(response.metadata.success, 1, "The source file has been written.");
                    start();
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });
});

module("Share", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                stop();
            },this.timeoutTime);
        });
    }
});
test("Share - a source file ", function(){
    var fun = window.fsjs.share;
    expect(1);

    stop();
    var testSourceName = "/test_write_file_does_not_exists_"+ +new Date()+".txt";
    var data = {content:"data data data data", contentType:"text/plain"};

    window.fsjs.createFile(testSourceName, function( response ){
        setTimeout(function(){
            window.fsjs.write(testSourceName, data, function( response ){
                setTimeout(function(){
                    fun(testSourceName, function( response ){
                        equals(response.metadata.success, 1, "The source file can be shared.");
                        start();
                    });
                },this.timeoutTime);
            });
        },this.timeoutTime);
    });
});

module("RemoveAll", {
    setUp: function(){
        stop();
        window.fsjs.requestFileSystem("TEMPORARY", 10, function( response ){
            setTimeout(function(){
                equals(response.metadata.success, 1, "The filesystem has been created.");

                start();
            },this.timeoutTime);
        });
    }
});

test("Remove all the files from the filesystem ", function(){
    expect(1);
    stop();
    window.fsjs.removeAll( function( response ){
        setTimeout(function(){
            equals(response.metadata.success, 1, "The files have been removed");
            start();
        },this.timeoutTime);
    });
});



