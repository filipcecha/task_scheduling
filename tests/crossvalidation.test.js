const crossvalidation = require('../crossvalidation');

const getDataBasis = crossvalidation.getDataBasis;
const getTriggerFields = crossvalidation.getTriggerFields;
const setTriggerFieldsStructure = crossvalidation.setTriggerFieldsStructure;
const getAllDepandandFields = crossvalidation.getAllDepandandFields;
const fieldIsNextInSequence = crossvalidation.fieldIsNextInSequence;
const setUpdateSequence = crossvalidation.setUpdateSequence;

const depandandFields_v1 = [
  { name: 'FIELD2', dataBasis: 'FIELD1' },
  { name: 'FIELD4', dataBasis: 'FIELD3' },
  { name: 'FIELD3', dataBasis: 'FIELD1,FIELD2' },
]

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
    let depandandFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1,FIELD2' },
    ];

    let expected = {'FIELD1': [], 'FIELD2': [], 'FIELD3': []};
    expect(setTriggerFieldsStructure(depandandFields)).toEqual(expected);

    depandandFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1' },
    ];

    expected = {'FIELD1': [], 'FIELD3': []};
    expect(setTriggerFieldsStructure(depandandFields)).toEqual(expected);
  })
  test('get all fields to be changed on trigger', () => {
    let depandandFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD2,FIELD1,FIELD7' },
      { name: 'FIELD6', dataBasis: 'FIELD5' },
    ];

    let expected = ['FIELD2', 'FIELD3', 'FIELD4'];
    expect(getAllDepandandFields('FIELD1', depandandFields)).toEqual(expected);

    expected = ['FIELD3', 'FIELD4'];
    expect(getAllDepandandFields('FIELD2', depandandFields)).toEqual(expected);
    
    expected = ['FIELD6'];
    expect(getAllDepandandFields('FIELD5', depandandFields)).toEqual(expected);
    
    expected = ['FIELD3', 'FIELD4'];
    expect(getAllDepandandFields('FIELD7', depandandFields)).toEqual(expected);
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

  test('sort update sequance of depandand fields', () => {
    let depandandFields = [
      { name: 'FIELD2', dataBasis: 'FIELD1,FIELD3,FIELD7' },
      { name: 'FIELD4', dataBasis: 'FIELD3' },
      { name: 'FIELD3', dataBasis: 'FIELD1' },
      { name: 'FIELD6', dataBasis: 'FIELD5' },
    ];

    expect(setUpdateSequence('FIELD5', depandandFields)).toEqual(['FIELD6']);
    expect(setUpdateSequence('FIELD1', depandandFields)).toEqual(['FIELD3', 'FIELD4', 'FIELD2']);
    expect(setUpdateSequence('FIELD3', depandandFields)).toEqual(['FIELD2', 'FIELD4']);
  })
})
