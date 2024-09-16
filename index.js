const { deployTestSDK } = require('./tests/shared_ledger/test_sdk');
const { clearSharedLedgerApp, testSharedLedger, testApproveRequests, testAddTrade, testAddMetadata, deploySharedLedger, testQueryInfo, testAudit, testMatchTradeDetails, testMatchAssetTransfer, testMatchMoneyTransfer, testMatchAMLSanction, addKredits } = require('./tests/shared_ledger/test_suite');

const deployApp = true;
const doNotDeployApp = false;

function levenshtein(a, b) {
  var t = [], u, i, j, m = a.length, n = b.length;
  if (!m) { return n; }
  if (!n) { return m; }
  for (j = 0; j <= n; j++) { t[j] = j; }
  for (i = 1; i <= m; i++) {
    for (u = [i], j = 1; j <= n; j++) {
      u[j] = a[i - 1] === b[j - 1] ? t[j - 1] : Math.min(t[j - 1], t[j], u[j - 1]) + 1;
    } t = u;
  } return u[n];
}

const testLevenshtein = async () => {
  //tests levenshtein function
  console.assert(levenshtein('kitten', 'sitting') === 3, 'levenshtein failed');
  console.assert(levenshtein('kitten', 'kitten') === 0, 'levenshtein failed');
  console.assert(levenshtein('kitten', 'kittens') === 1, 'levenshtein failed');
  console.assert(levenshtein('kitten', 'kittenss') === 2, 'levenshtein failed');
  console.assert(levenshtein('kitten', 'kittensss') === 3, 'levenshtein failed');
  console.assert(levenshtein('kitten', 'kittenssss') === 4, 'levenshtein failed');
  console.assert(levenshtein('kitten', 'k') === 5, 'levenshtein failed');
  console.assert(levenshtein('kitten', '') === 6, 'levenshtein failed');
  console.assert(levenshtein('', 'kitten') === 6, 'levenshtein failed');  
}

const runTests = async () => {
  // await deployTestSDK();
  await deploySharedLedger();
  // await addKredits();
  
  // await testLevenshtein();

  // let success = await clearSharedLedgerApp('klave1');
  // let [sharedLedgerId1] = await testSharedLedger('klave1');

  // success = await testAddTrade('klave1', sharedLedgerId1, 2, 'northernEurope');
  // console.assert(success === false, 'SuperAdmin should not be able to add trade');

  // //klave2 adds now a trade
  // let epoch = Date.now();
  // success = await testAddTrade('klave2', sharedLedgerId1, 2, 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1', 12, 134567, epoch);
  // console.assert(success === true, 'klave2 should be able to add trade');

  // //klave2 does not have the correct role for confirmation, actually no one here has the correct role
  // success = await testAddMetadata('klave2', sharedLedgerId1, 2, 'northernEurope', true, 'Any metadata, even JSON if you want');

  // //Try several profiles
  // success = await testQueryInfo('klave2', sharedLedgerId1, 2, 'northernEurope');    
  // success = await testQueryInfo('klave3', sharedLedgerId1, 8, 'northernEurope');    
  // success = await testQueryInfo('klave4', sharedLedgerId1, 6, 'northernEurope');    
  // success = await testQueryInfo('klave5', sharedLedgerId1, 7, 'northernEurope');    

  // //klave3 now confirms the trade, wrong data
  // success = await testMatchTradeDetails('klave3', sharedLedgerId1, 8, 'northernEurope', 'Buyer#1', 'UK', 'Seller#2', 'UK');
  // console.assert(success === false, 'klave3 should not be able to match the trade details');

  // success = await testMatchTradeDetails('klave3', sharedLedgerId1, 8, 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1');
  // console.assert(success === true, 'klave3 should be able to confirm the trade');
  
  // success = await testMatchAssetTransfer('klave4', sharedLedgerId1, 6, 'northernEurope', 'Asset#1', 12);
  // console.assert(success === true, 'klave4 should be able to confirm the trade');

  // success = await testMatchMoneyTransfer('klave5', sharedLedgerId1, 7, 'northernEurope', 'Asset#1', 134567);
  // console.assert(success === true, 'klave5 should be able to confirm the trade');

  // success = await testMatchAMLSanction('klave6', sharedLedgerId1, 10, 'northernEurope', 'true', 0.02);
  // console.assert(success === true, 'klave6 should be able to confirm the trade');

  // //Try several profiles
  // success = await testQueryInfo('klave2', sharedLedgerId1);    
  // success = await testQueryInfo('klave3', sharedLedgerId1);    
  // success = await testQueryInfo('klave4', sharedLedgerId1);    
  // success = await testQueryInfo('klave5', sharedLedgerId1);    

  // //klave2 adds now a trade  
  // epoch = Date.now();
  // success = await testAddTrade('klave2', sharedLedgerId1, 2, 'northernEurope', 'Buyer#1', 'UK', 'Seller#1', 'UK', 'Asset#1', 12, 134567, epoch);
  // console.assert(success === true, 'klave2 should be able to add trade');
  
  // //klave4 has the correct role for audit but doesn't exist yet, it will be automatically created
  // success = await testAudit('klave6', sharedLedgerId1, 9, 'northernEurope');

  // //klave5 has the correct role for audit but doesn't exist yet (will be automatically created) and has the wrong jurisdiction
  // success = await testAudit('klave6', sharedLedgerId1, 9, 'UK');

  // success = await clearSharedLedgerApp('klave1');
};

runTests();
