
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

  //Check the fsapi library
  ok( !!window.fsapi, "FileSystem API is present");
})
module("FileSystem API");
test("fsapi methods", function(){
    expect(1);
    //Check the requestQuota method
    ok(!!window.fsapi.requestQuota, "RequestQuota method is present.");
});

test("requestQuota - quota type is invalid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(2);
    raises(function(){
        requestQuota("not valid", 2, function(){}, function(){});
    }, Error, "The quota type is invalid");
    raises(function(){
        requestQuota("", 2, function(){}, function(){});
    }, Error, "The quota type is invalid");
});

test("requestQuota - quota type is valid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(3);
    equals(requestQuota("TEMPORARY", 2, function(){}, function(){}), true, "The quota type is valid(TEMPORARY)");
    equals(requestQuota("PERSISTENT", 2, function(){}, function(){}), true, "The quota type is valid(PERSISTENT)");
    equals(requestQuota("PerSiStenT", 2, function(){}, function(){}), true, "The quota type is valid(PERSISTENT)");
});

test("requestQuota - size is invalid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(3);
    raises(function(){
        requestQuota("TEMPORARY", "", function(){}, function(){});
    }, Error, "The size is invalid(not integer)");
    raises(function(){
        requestQuota("TEMPORARY", -1, function(){}, function(){});
    }, Error, "The size is lower than 0");
    raises(function(){
        requestQuota("TEMPORARY", Number.Infinity, function(){}, function(){});
    }, Error, "The size is Infinity");
});

test("requestQuota - size is valid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(3);
    equals(requestQuota("TEMPORARY", 0, function(){}, function(){}), true, "Size equals to 0 is valid");
    equals(requestQuota("TEMPORARY", 2, function(){}, function(){}), true, "Size is higher than 0");
    equals(requestQuota("TEMPORARY", Number.MAX_VALUE + 1, function(){}, function(){}), true, "Size is a big number");
});

test("requestQuota - successCallBack is invalid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(3);
    raises(function(){
        requestQuota("TEMPORARY", 1, "", function(){});
    }, Error, "The success callback is an empty string");
    raises(function(){
        requestQuota("TEMPORARY", 1, {}, function(){});
    }, Error, "The successCallback is an object literal");
    raises(function(){
        requestQuota("TEMPORARY", 1, null, function(){});
    }, Error, "The successCallback is null");
});

test("requestQuota - successCallBack is valid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(1);
    equals(requestQuota("TEMPORARY", 1, function(){}, function(){}), true, "The successCallback is a function.");
});

test("requestQuota - errorCallBack is invalid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(3);
    raises(function(){
        requestQuota("TEMPORARY", 1, function(){}, null);
    }, Error, "The errorCallback is an empty string");
    raises(function(){
        requestQuota("TEMPORARY", 1, function(){}, null);
    }, Error, "The errorCallback is an object literal");
    raises(function(){
        requestQuota("TEMPORARY", 1, function(){}, null);
    }, Error, "The errorCallback is null");
});

test("requestQuota - errorCallback is valid", function(){
    var requestQuota = window.fsapi.requestQuota;
    expect(1);
    equals(requestQuota("TEMPORARY", 1, function(){}, function(){}), true, "The errorCallback is a function.");
});