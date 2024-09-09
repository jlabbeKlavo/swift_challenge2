const { deployTestSDK } = require('./tests/shared_ledger/test_sdk');
const { deployDataRoom, clearDataRoomApp, testDataRoom, testApproveRequests, testAddFile } = require('./tests/shared_ledger/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deployTestSDK();
  await deployDataRoom();
  let success = await clearDataRoomApp('klave1');
  let [storageServerKeyName1, dataRoomId1] = await testDataRoom('klave1');
  // let [storageServerKeyName2, dataRoomId2] = await testDataRoom('klave2');
  // success = await testApproveRequests('klave1');
  // let [storageServerKeyName3, dataRoomId3] = await testDataRoom('klave2');
  // success = await testAddFile('klave3', dataRoomId1, storageServerKeyName1);
  // success = await testApproveRequests('klave2');
  // success = await testApproveRequests('klave1');
  // success = await testAddFile('klave3', dataRoomId1, storageServerKeyName1);
};

runTests();
