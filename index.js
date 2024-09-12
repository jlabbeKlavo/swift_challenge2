const { deployTestSDK } = require('./tests/shared_ledger/test_sdk');
const { clearSharedLedgerApp, testSharedLedger, testApproveRequests, testAddTrade, testAddMetadata, deploySharedLedger, testQueryInfo, testAudit, testMatchTradeDetails, testMatchAssetTransfer, testMatchMoneyTransfer } = require('./tests/shared_ledger/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deployTestSDK();
  // await deploySharedLedger();
  
  let success = await clearSharedLedgerApp('klave1');
  let [sharedLedgerId1] = await testSharedLedger('klave1');

  success = await testAddTrade('klave1', sharedLedgerId1, 2, 'northernEurope');
  console.assert(success === false, 'SuperAdmin should not be able to add trade');

  //klave2 adds now a trade
  let epoch = Date.now();
  success = await testAddTrade('klave2', sharedLedgerId1, 2, 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1', 12, 134567, epoch);
  console.assert(success === true, 'klave2 should be able to add trade');

  //klave2 does not have the correct role for confirmation, actually no one here has the correct role
  success = await testAddMetadata('klave2', sharedLedgerId1, 2, 'northernEurope', true, 'Any metadata, even JSON if you want');

  //klave3 now confirms the trade, wrong data
  success = await testMatchTradeDetails('klave3', sharedLedgerId1, 8, 'northernEurope', 'Buyer#1', 'UK', 'Seller#2', 'UK');
  console.assert(success === false, 'klave3 should not be able to match the trade details');

  success = await testMatchTradeDetails('klave3', sharedLedgerId1, 8, 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1');
  console.assert(success === true, 'klave3 should be able to confirm the trade');
  
  success = await testMatchAssetTransfer('klave4', sharedLedgerId1, 6, 'northernEurope', 'Asset#1', 12);
  console.assert(success === true, 'klave4 should be able to confirm the trade');

  success = await testMatchMoneyTransfer('klave5', sharedLedgerId1, 7, 'northernEurope', 'Asset#1', 134567);
  console.assert(success === true, 'klave5 should be able to confirm the trade');

  //Try several profiles
  success = await testQueryInfo('klave2', sharedLedgerId1);    
  success = await testQueryInfo('klave3', sharedLedgerId1);    
  success = await testQueryInfo('klave4', sharedLedgerId1);    
  success = await testQueryInfo('klave5', sharedLedgerId1);    

  //klave2 adds now a trade  
  epoch = Date.now();
  success = await testAddTrade('klave2', sharedLedgerId1, 2, 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1', 12, 134567, epoch);
  console.assert(success === true, 'klave2 should be able to add trade');
  
  //klave4 has the correct role for audit but doesn't exist yet, it will be automatically created
  success = await testAudit('klave6', sharedLedgerId1, 9, 'northernEurope');

  //klave5 has the correct role for audit but doesn't exist yet (will be automatically created) and has the wrong jurisdiction
  success = await testAudit('klave6', sharedLedgerId1, 9, 'UK');

  success = await clearSharedLedgerApp('klave1');
};

runTests();
