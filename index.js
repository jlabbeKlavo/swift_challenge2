const { deployTestSDK } = require('./tests/shared_ledger/test_sdk');
const { clearSharedLedgerApp, testSharedLedger, testApproveRequests, testAddTrade, testConfirmTrade, deploySharedLedger, testQueryInfo } = require('./tests/shared_ledger/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deployTestSDK();
  // await deploySharedLedger();

  let success = await clearSharedLedgerApp('klave1');
  let [sharedLedgerId1] = await testSharedLedger('klave1');

  //SuperAdmin should not be able to add trade
  success = await testAddTrade('klave1', sharedLedgerId1, 'trader', 'europe');

  //klave2 does not exist but will be created here
  success = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'europe');
  //klave1 approves klave2
  success = await testApproveRequests('klave1');

  //klave2 adds now a trade
  let [UTI, tokenB64] = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'europe', 'Buyer#1', 'Seller#1', 'Asset#1', 12, 134567, Date.now());

  //klave2 does not have the correct role for confirmation, actually no one here has the correct role
  success = await testConfirmTrade('klave2', sharedLedgerId1, 'trader', 'europe', UTI, tokenB64, 'Confirmed');

  //klave3 does not exist but will be created here
  success = await testConfirmTrade('klave3', sharedLedgerId1, 'clearingHouse', 'europe', UTI, tokenB64, 'Confirmed');
  //klave1 approves klave3
  success = await testApproveRequests('klave1');

  //klave2 now confirms the trade
  success = await testConfirmTrade('klave3', sharedLedgerId1, 'clearingHouse', 'europe', UTI, tokenB64, 'Confirmed');

  //klave2 queries the trade, should only get the trade execution details
  success = await testQueryInfo('klave2', sharedLedgerId1, UTI, tokenB64);    

  //klave3 queries the trade, should only get the trade confirmation details
  success = await testQueryInfo('klave3', sharedLedgerId1, UTI, tokenB64);    
};

runTests();
