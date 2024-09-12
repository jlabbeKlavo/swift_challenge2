const { deployTestSDK } = require('./tests/shared_ledger/test_sdk');
const { clearSharedLedgerApp, testSharedLedger, testApproveRequests, testAddTrade, testAddMetadata, deploySharedLedger, testQueryInfo, testAudit, testMatchTradeDetails } = require('./tests/shared_ledger/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deployTestSDK();
  await deploySharedLedger();
  
  // let success = await clearSharedLedgerApp('klave1');
  // let [sharedLedgerId1] = await testSharedLedger('klave1');

  // success = await testAddTrade('klave1', sharedLedgerId1, 'trader', 'northernEurope');
  // console.assert(success === false, 'SuperAdmin should not be able to add trade');

  // //klave2 adds now a trade
  // let epoch = Date.now();
  // success = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1', 12, 134567, epoch);
  // console.assert(success === true, 'klave2 should be able to add trade');

  // //klave2 does not have the correct role for confirmation, actually no one here has the correct role
  // success = await testAddMetadata('klave2', sharedLedgerId1, 'trader', 'northernEurope', true, 'Any metadata, even JSON if you want');

  // //klave3 now confirms the trade, wrong data
  // success = await testMatchTradeDetails('klave3', sharedLedgerId1, 'settlementAgent', 'northernEurope', 'Buyer#1', 'UK', 'Seller#2', 'UK');
  // console.assert(success === false, 'klave3 should not be able to match the trade details');

  // success = await testMatchTradeDetails('klave3', sharedLedgerId1, 'settlementAgent', 'northernEurope', 'Buyer#1', 'UK', 'Seller#2', 'UK');
  // console.assert(success === true, 'klave3 should be able to confirm the trade');
  
  // //klave2 queries the trade, should only get the trade execution details
  // success = await testQueryInfo('klave2', sharedLedgerId1, Trades[0].UTI, Trades[0].tokenB64);    

  // //klave3 queries the trade, should only get the trade confirmation details
  // success = await testQueryInfo('klave3', sharedLedgerId1, Trades[0].UTI, Trades[0].tokenB64);    

  // //klave2 adds now a trade
  // yyyymmddThhmmss = new Date().toISOString().slice(0,19).replace(/-/g,"").replace(/:/g,"");    
  // [UTI, tokenB64] = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'northernEurope', 'Buyer#1', 'Seller#2', 'Asset#2', 4, 245, yyyymmddThhmmss);
  // //Keep in a list of couple UTI/tokenB64 the UTI and tokenB64 for later use
  // Trades.push({UTI, tokenB64});
  
  // //klave4 has the correct role for audit but doesn't exist yet, it will be automatically created
  // success = await testAudit('klave4', sharedLedgerId1, 'regulator', 'northernEurope', Trades);

  // //klave5 has the correct role for audit but doesn't exist yet (will be automatically created) and has the wrong jurisdiction
  // success = await testAudit('klave5', sharedLedgerId1, 'regulator', 'UK', Trades);

  // success = await clearSharedLedgerApp('klave1');
};

runTests();
