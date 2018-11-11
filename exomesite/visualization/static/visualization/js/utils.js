// process json encoded strings into data types specified in 
// exomesite/visualization/models.py
function jsonStringToInt(jsonString) {
    return parseInt(jsonString);
}

function jsonStringArrayToIntArray(jsonStringArray) {
    var intArray = [];
    var stringArray = jsonStringArray.split(",");
    stringArray.pop()    // trailing comma that must be removed
    
    var length = stringArray.length;
    for (var i = 0; i < length; i++) {
        intArray[i] = jsonStringToInt(stringArray[i]);
    }

    return intArray;
}