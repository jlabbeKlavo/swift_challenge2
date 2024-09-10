const { deployTestSDK } = require('./tests/shared_ledger/test_sdk');
const { clearSharedLedgerApp, testSharedLedger, testApproveRequests, testAddTrade, testActionOnTrade, deploySharedLedger, testQueryInfo, testAudit } = require('./tests/shared_ledger/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deployTestSDK();
  // await deploySharedLedger();

  let success = await clearSharedLedgerApp('klave1');
  let [sharedLedgerId1] = await testSharedLedger('klave1');

  //SuperAdmin should not be able to add trade
  success = await testAddTrade('klave1', sharedLedgerId1, 'trader', 'northernEurope');

  //klave2 does not exist but will be created here
  success = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'northernEurope');
  //klave1 approves klave2
  success = await testApproveRequests('klave1');


  //klave2 adds now a trade
  let yyyymmddThhmmss = new Date().toISOString().slice(0,19).replace(/-/g,"").replace(/:/g,"");  
  let [UTI, tokenB64] = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'northernEurope', 'Buyer#1', 'Seller#1', 'Asset#1', 12, 134567, yyyymmddThhmmss);
  //Keep in a list of couple UTI/tokenB64 the UTI and tokenB64 for later use
  let Trades = [{UTI, tokenB64}];

  //klave2 does not have the correct role for confirmation, actually no one here has the correct role
  success = await testActionOnTrade('klave2', sharedLedgerId1, 'trader', 'northernEurope', Trades[0].UTI, Trades[0].tokenB64, 'confirm', 'Confirmed Metadata');

  //klave3 does not exist but will be created here
  success = await testActionOnTrade('klave3', sharedLedgerId1, 'clearingHouse', 'northernEurope', Trades[0].UTI, Trades[0].tokenB64, 'confirm', 'Confirmed Metadata');
  //klave1 approves klave3
  success = await testApproveRequests('klave1');

  //klave2 now confirms the trade
  success = await testActionOnTrade('klave3', sharedLedgerId1, 'clearingHouse', 'northernEurope', Trades[0].UTI, Trades[0].tokenB64, 'confirm', 'Confirmed Metadata');

  //klave2 queries the trade, should only get the trade execution details
  success = await testQueryInfo('klave2', sharedLedgerId1, Trades[0].UTI, Trades[0].tokenB64);    

  //klave3 queries the trade, should only get the trade confirmation details
  success = await testQueryInfo('klave3', sharedLedgerId1, Trades[0].UTI, Trades[0].tokenB64);    

  //klave2 adds now a trade
  yyyymmddThhmmss = new Date().toISOString().slice(0,19).replace(/-/g,"").replace(/:/g,"");    
  [UTI, tokenB64] = await testAddTrade('klave2', sharedLedgerId1, 'trader', 'northernEurope', 'Buyer#1', 'Seller#2', 'Asset#2', 4, 245, yyyymmddThhmmss);
  //Keep in a list of couple UTI/tokenB64 the UTI and tokenB64 for later use
  Trades.push({UTI, tokenB64});
  
  //klave4 has the correct role for audit but doesn't exist yet
  success = await testAudit('klave4', sharedLedgerId1, 'regulator', 'northernEurope', Trades);
  //klave1 approves klave4
  success = await testApproveRequests('klave1');
  //klave4 has the correct role for audit but doesn't exist yet
  success = await testAudit('klave4', sharedLedgerId1, 'regulator', 'northernEurope', Trades);

  //klave5 has the correct role for audit but doesn't exist yet and has the wrong jurisdiction
  success = await testAudit('klave5', sharedLedgerId1, 'regulator', 'UK', Trades);
  //klave1 approves klave4
  success = await testApproveRequests('klave1');
  //klave4 has the correct role for audit but doesn't exist yet
  success = await testAudit('klave5', sharedLedgerId1, 'regulator', 'UK', Trades);

};

runTests();
