function getDataBasis (field) {
    return field.dataBasis.split(',');
}

function getTriggerFields(depandandField) {
    var triggeFields = {}
    getDataBasis(depandandField).forEach(function (field) {
        triggeFields[field] = []
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

function fieldIsNextInSequence(fieldsToChange, fieldsToChangeSorted, currentField) {
    var dataBasis = getDataBasis(currentField);

    function fieldIsInFieldsToChange (field) {
        return fieldsToChange.indexOf(field) !== -1;
    }

    function fieldIsInSortedFiels (field) {
        return fieldsToChangeSorted.indexOf(field) !== -1
    }

    function allDependenciesAreSatisfied(dataBasis) {
        var dependency = dataBasis.filter(function (field) {
            return fieldIsInFieldsToChange(field) && !fieldIsInSortedFiels(field);
        })
        return dependency.length === 0;
    }

    var hasSingleDataBasis = dataBasis.length === 1;

    return (hasSingleDataBasis && (!fieldIsInFieldsToChange(dataBasis[0]) ||  fieldIsInSortedFiels(dataBasis[0]))) || allDependenciesAreSatisfied(dataBasis);
}

function setUpdateSequence (fieldName, depandandFields) {
    var fieldsToChange = getAllDepandandFields(fieldName, depandandFields);
    var fieldsToChangeSorted = []
    
    // sort update sequence
    var index = 0;
    while (fieldsToChange.length !== fieldsToChangeSorted.length) {
        if (index > fieldsToChange.length) index = 0;
        
        var currentField = depandandFields.filter(function (field) {
            return field.name === fieldsToChange[index];
        })[0];
        
        if (currentField && fieldIsNextInSequence(fieldsToChange, fieldsToChangeSorted, currentField)) {
            fieldsToChangeSorted.push(currentField.name);
        }
        index++;
    }

    return fieldsToChangeSorted;
}

function setTriggerFieldsUpdateSequence (depandandFields) {
    var triggerFieldStructure = setTriggerFieldsStructure(depandandFields);

    Object.keys(triggerFieldStructure).forEach(function (triggerField) {
        var fieldUpdateSequence = setUpdateSequence(triggerField, depandandFields);
        triggerFieldStructure[triggerField] = fieldUpdateSequence;
    })

    return triggerFieldStructure;
}

module.exports = {
    getTriggerFields: getTriggerFields,
    getDataBasis: getDataBasis,
    setTriggerFieldsStructure: setTriggerFieldsStructure,
    getAllDepandandFields: getAllDepandandFields,
    fieldIsNextInSequence: fieldIsNextInSequence,
    setUpdateSequence: setUpdateSequence,
    setTriggerFieldsUpdateSequence: setTriggerFieldsUpdateSequence,
};
