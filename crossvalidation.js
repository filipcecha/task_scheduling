function getDataBasis (field) {
    return field.dataBasis.split(',') || [];
}

function getTriggerFields(depandandField) {
    var triggeFields = {}
    getDataBasis(depandandField).forEach(function (field) {
        triggeFields[field] = {}
    });
    return triggeFields;
}

function setTriggerFieldsStructure (depandandFields) {
    triggerFieldsStructure = {};
    depandandFields.forEach(function (depandandField) {
        Object.assign(triggerFieldsStructure, getTriggerFields(depandandField));
    });
    return triggerFieldsStructure;
}

function getAllDepandandFields (fieldName, depandandFields) {
    var fieldsToChange = []

    depandandFields.forEach(function (field) {
        if (getDataBasis(field).indexOf(fieldName) !== -1) {
            fieldsToChange.push(field.name);
            getAllDepandandFields(field.name, depandandFields).forEach(function (field) {
                fieldsToChange.push(field);
            });
        }
    });
    return fieldsToChange.filter(function (field, index, ftc) { return index === ftc.indexOf(field)});
}

function fieldIsNextInSequence(fieldName, fieldsToChange, fieldsToChangeSorted, currentField) {
    var dataBasis = getDataBasis(currentField)

    function fieldIsInFieldsToChange (field) {
        return fieldsToChange.indexOf(field) !== -1;
    }

    function fieldIsInSortedFiels (field) {
        return fieldsToChangeSorted.indexOf(field) !== -1
    }

    var hasSingleDataBasis = dataBasis.length === 1;

    console.log(fieldIsInFieldsToChange(dataBasis[0]));
    return (hasSingleDataBasis && !fieldIsInFieldsToChange(dataBasis[0])) || 
           (hasSingleDataBasis && fieldIsInSortedFiels(dataBasis[0]));
}

function setUpdateSequence (fieldName, depandandFields) {
    var fieldsToChange = getAllDepandandFields(fieldName, depandandFields);
    var fieldsToChangeSorted = []
    
    // sort update sequence
    var index = 0;
    while (fieldsToChange.length !== fieldsToChangeSorted.length) {
        index > fieldsToChange.length ? index = 0 : index++;
        
        var currentField = depandandFields.filter(function (field) {
            return field.name === fieldsToChange[index];
        });

        if (fieldIsNextInSequence(fieldName, fieldsToChange, fieldsToChangeSorted, currentField)) {
            fieldsToChangeSorted.push(currentField.name);
        }
    }

    return fieldsToChangeSorted;
}

module.exports = {
    getTriggerFields: getTriggerFields,
    getDataBasis: getDataBasis,
    setTriggerFieldsStructure: setTriggerFieldsStructure,
    getAllDepandandFields: getAllDepandandFields,
    fieldIsNextInSequence: fieldIsNextInSequence,
    setUpdateSequence: setUpdateSequence,
};
