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

function setTriggerFieldsStructure (dependentFields) {
    triggerFieldsStructure = {};
    dependentFields.forEach(function (depandandField) {
        Object.assign(triggerFieldsStructure, getTriggerFields(depandandField));
    });
    return triggerFieldsStructure;
}

function getAllDependentFields (fieldName, dependentFields) {
    var fieldsToChange = []

    dependentFields.forEach(function (field) {
        if (getDataBasis(field).indexOf(fieldName) !== -1) {
            fieldsToChange.push(field.name);
            getAllDependentFields(field.name, dependentFields).forEach(function (field) {
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

function setUpdateSequence (fieldName, dependentFields) {
    var fieldsToChange = getAllDependentFields(fieldName, dependentFields);
    var fieldsToChangeSorted = []
    
    // sort update sequence
    var index = 0;
    while (fieldsToChange.length !== fieldsToChangeSorted.length) {
        if (index > fieldsToChange.length) index = 0;
        
        var currentField = dependentFields.filter(function (field) {
            return field.name === fieldsToChange[index];
        })[0];
        
        if (currentField && fieldIsNextInSequence(fieldsToChange, fieldsToChangeSorted, currentField)) {
            fieldsToChangeSorted.push(currentField.name);
        }
        index++;
    }

    return fieldsToChangeSorted;
}

function setTriggerFieldsUpdateSequence (dependentFields) {
    var triggerFieldStructure = setTriggerFieldsStructure(dependentFields);

    Object.keys(triggerFieldStructure).forEach(function (triggerField) {
        var fieldUpdateSequence = setUpdateSequence(triggerField, dependentFields);
        triggerFieldStructure[triggerField] = fieldUpdateSequence;
    })

    return triggerFieldStructure;
}

module.exports = {
    getTriggerFields: getTriggerFields,
    getDataBasis: getDataBasis,
    setTriggerFieldsStructure: setTriggerFieldsStructure,
    getAllDependentFields: getAllDependentFields,
    fieldIsNextInSequence: fieldIsNextInSequence,
    setUpdateSequence: setUpdateSequence,
    setTriggerFieldsUpdateSequence: setTriggerFieldsUpdateSequence,
};
