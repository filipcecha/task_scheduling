const taks_scheduler = require('../taks_scheduler');

const getDataBasis = taks_scheduler.getDataBasis;
const getTriggerFields = taks_scheduler.getTriggerFields;
const setTriggerFieldsStructure = taks_scheduler.setTriggerFieldsStructure;
const getAllDependentFields = taks_scheduler.getAllDependentFields;
const fieldIsNextInSequence = taks_scheduler.fieldIsNextInSequence;
const setUpdateSequence = taks_scheduler.setUpdateSequence;
const setTriggerFieldsUpdateSequence = taks_scheduler.setTriggerFieldsUpdateSequence;

describe('test getting data basis from field', () => {
  test('get fields data basis with one basis', () => {
    expect(getDataBasis({ name: 'FIELD2', dataBasis: 'FIELD1' })).toEqual(['FIELD1']);
  })
  test('get fields data basis with multiple basis', () => {
    expect(getDataBasis({ name: 'FIELD2', dataBasis: 'FIELD1,FIELD2' })).toEqual(['FIELD1', 'FIELD2']);
  })
});

describe('test setting trigger fields structure', () => {
  test('get trigger fields from fields data basis', () => {
    expect(getTriggerFields({ name: 'FIELD2', dataBasis: 'FIELD1' })).toEqual({'FIELD1': []});
    expect(getTriggerFields({ name: 'FIELD2', dataBasis: 'FIELD1,FIELD3' })).toEqual({'FIELD1': [], 'FIELD3': []});
  })
  test('set triggier fields struture without depandand fields', () => {
    let dependentFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1,FIELD2' },
    ];

    let expected = {'FIELD1': [], 'FIELD2': [], 'FIELD3': []};
    expect(setTriggerFieldsStructure(dependentFields)).toEqual(expected);

    dependentFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1' },
    ];

    expected = {'FIELD1': [], 'FIELD3': []};
    expect(setTriggerFieldsStructure(dependentFields)).toEqual(expected);
  })
  test('get all fields to be changed on trigger', () => {
    let dependentFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD2,FIELD1,FIELD7' },
      { name: 'FIELD6', dataBasis: 'FIELD5' },
    ];

    let expected = ['FIELD2', 'FIELD3', 'FIELD4'];
    expect(getAllDependentFields('FIELD1', dependentFields)).toEqual(expected);

    expected = ['FIELD3', 'FIELD4'];
    expect(getAllDependentFields('FIELD2', dependentFields)).toEqual(expected);
    
    expected = ['FIELD6'];
    expect(getAllDependentFields('FIELD5', dependentFields)).toEqual(expected);
    
    expected = ['FIELD3', 'FIELD4'];
    expect(getAllDependentFields('FIELD7', dependentFields)).toEqual(expected);
  })
  test('should field be added as next in sequence', () => {
    const fieldName = 'FIELD1';
    let fieldsToChange = ['FIELD2', 'FIELD3', 'FIELD4'];
    
    let currentField = { name: 'FIELD3', dataBasis: 'FIELD1' };
    let fieldsToChangeSorted = [];
    expect(fieldIsNextInSequence(fieldsToChange, fieldsToChangeSorted, currentField)).toBeTruthy()

    currentField = { name: 'FIELD4', dataBasis: 'FIELD3' };
    fieldsToChangeSorted = ['FIELD3'];
    expect(fieldIsNextInSequence(fieldsToChange, fieldsToChangeSorted, currentField)).toBeTruthy()

    currentField = { name: 'FIELD2', dataBasis: 'FIELD1,FIELD3,FIELD7' };
    fieldsToChangeSorted = ['FIELD3', 'FIELD4'];
    expect(fieldIsNextInSequence(fieldsToChange, fieldsToChangeSorted, currentField)).toBeTruthy()

  })

  test('sort update sequance of dependent fields', () => {
    let dependentFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1,FIELD3,FIELD7' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1' },
      { name: 'FIELD6', dataBasis: 'FIELD5' },
    ];

    expect(setUpdateSequence('FIELD5', dependentFields)).toEqual(['FIELD6']);
    expect(setUpdateSequence('FIELD1', dependentFields)).toEqual(['FIELD3', 'FIELD4', 'FIELD2']);
    expect(setUpdateSequence('FIELD3', dependentFields)).toEqual(['FIELD2', 'FIELD4']);
  })
  test('set update sequences for all trigger fields', () => {
    let dependentFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1,FIELD3,FIELD7' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1' },
      { name: 'FIELD6', dataBasis: 'FIELD5' },
    ];

    let triggerSequence = {
      'FIELD1': ['FIELD3', 'FIELD4', 'FIELD2'],
      'FIELD3': ['FIELD2', 'FIELD4'],
      'FIELD5': ['FIELD6'],
      'FIELD7': ['FIELD2']
    }

    expect(setTriggerFieldsUpdateSequence(dependentFields)).toEqual(triggerSequence);
  })
})
