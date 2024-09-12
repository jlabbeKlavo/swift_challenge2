const fs = require('fs');
const { subtle_Hash } = require('./subtle');
const { klaveDeployApp, klaveTransaction, klaveQuery, klaveCloseConnection, klaveOpenConnection } = require('../../klave_network');
const { arrayBufferToBase64 } = require('../../utils');
const { importPublicKey } = require('./test_sdk');

//wasm to deploy must be copied post generation coming from yarn build command
const app_id = "test_shared_ledger";
const fqdn = "test_shared_ledger_smart_contract_florian_4";
const WASM_TEST_SHARED_LEDGER = './config/wasm/shared_ledger.b64';

const deploySharedLedger = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    let result = await klaveDeployApp(app_id, fqdn, WASM_TEST_SHARED_LEDGER);
  }
  klaveCloseConnection();
}

const clearSharedLedgerApp = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    let result = await klaveTransaction(fqdn, "clearAll", "");
  }
  klaveCloseConnection();
}

const createSharedLedger = async () => {    
  let drInput = {
    "SLID": "",
  };
  let result = await klaveTransaction(fqdn,"createSharedLedger", drInput);
  return result.message.split(":")[1].trim();
}

const listSharedLedgers = async () => {
  let result = await klaveTransaction(fqdn,"listSharedLedgers", "");
  return result.result;
}

const getSharedLedgerContent = async (sharedLedgerId) => {
    let drInput = {
      "SLID": sharedLedgerId,
    };
    let result = await klaveTransaction(fqdn,"getSharedLedgerContent", drInput);
  return result.result;
}

const getUserContent = async () => {
  let result = await klaveTransaction(fqdn,"getUserContent", "");
  return result.result;
}

const submitTrade = async (sharedLedgerId, buyer, buyerCountry, seller, sellerCountry, asset, quantity, price, tradeDate, jurisdiction) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": "",
    "tradeInfo": {
      "buyerName": buyer,
      "buyerCountry": buyerCountry,
      "sellerName": seller,
      "sellerCountry": sellerCountry,
      "asset": asset,
      "quantity": quantity,
      "price": price,
      "tradeDate": tradeDate,
      "jurisdiction": jurisdiction
    }
  };  

  let dateString = new Date(parseInt(tradeDate)).toISOString().slice(0, 10).replace("-", "").replace("-", "");

  let result = await klaveTransaction(fqdn,"submitTrade", drInput);
  return result.result.status === 'success' ? true : false;
}

const addMetadata = async (sharedLedgerId, UTI, tokenB64, publicData, metadata) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "publicData": publicData,
    "metadata": metadata  
  };  

  let result = await klaveTransaction(fqdn,"addMetadata", drInput);
  return result;
}

const exactMatch = async (sharedLedgerId, UTI, tokenB64, key, value) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "key": key,
    "value": value
  };  

  let result = await klaveTransaction(fqdn,"exactMatch", drInput);
  return result;
}

const levenshteinMatch = async (sharedLedgerId, UTI, tokenB64, key, value, distance) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "key": key,
    "value": value,
    "distance": distance
  };  

  let result = await klaveTransaction(fqdn,"levenshteinMatch", drInput);
  return result;
}

const boundaryMatch = async (sharedLedgerId, UTI, tokenB64, key, min, max) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "key": key,
    "min": min,
    "max": max
  };  

  let result = await klaveTransaction(fqdn,"boundaryMatch", drInput);
  return result;
}

const getAllTrades = async (sharedLedgerId) => {
  let drInput = {
    "SLID": sharedLedgerId
  };
  let result = await klaveTransaction(fqdn,"getAllTrades", drInput);
  return result.result;
}

const getTradeInfo = async (sharedLedgerId, UTI, tokenB64) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64    
  };  

  let result = await klaveTransaction(fqdn,"getTradeInfo", drInput);
  return result.result;
}

const getMultipleTradeInfo = async (sharedLedgerId, tradeIdentifications) => {
  let trades = [];
  for (let i = 0; i < tradeIdentifications.length; i++) {
    let trade = {
      "UTI": tradeIdentifications[i].UTI, 
      "tokenB64": tradeIdentifications[i].tokenB64
    };
    trades.push(trade);
  }

  let drInput = {
    "SLID": sharedLedgerId,
    "trades": trades,
  };  

  let result = await klaveTransaction(fqdn,"getMultipleTradeInfo", drInput);
  return result;
}

const resetIdentities = async () => {
  let resetIdentitiesInput = {
    "resetKlaveServer": true
  };
  let result = await klaveTransaction(fqdn, "resetIdentities", resetIdentitiesInput);
  return result.success;  
}

const getPublicKeys = async () => {
  let result = await klaveQuery(fqdn, "getPublicKeys", "");  
  return result.result;
}

const createUserRequest = async (sharedLedgerId, role, jurisdiction) => {
  let createUserRequestInput = {
    "SLID": sharedLedgerId,
    "role": role,
    "jurisdiction": jurisdiction,
  };
  let result = await klaveTransaction(fqdn, "createUserRequest", createUserRequestInput);
  return result.success;
}

const listUserRequests = async () => {
  let result = await klaveTransaction(fqdn, "listUserRequests", "");
  return result.result;
}

const addUserNoAppovalNeeded = async (sharedLedgerId, role, jurisdiction) => {
  let addUserNoAppovalNeededInput = {
    "SLID": sharedLedgerId,
    "role": role,
    "jurisdiction": jurisdiction,
  };
  let result = await klaveTransaction(fqdn, "addUserNoAppovalNeeded", addUserNoAppovalNeededInput);
  return result.success;
}

const testSharedLedger = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let sharedLedgerId = "";
  if (user_connected) {
    let userContent = await getUserContent();
    if (userContent && userContent.roles.length > 0 &&
      userContent.roles[0].sharedLedgerId == "super" && userContent.roles[0].role == "admin") {

    } 
    else {
      //Create SuperAdmin using the SCP key
      let result = await klaveTransaction(fqdn, "createSuperAdmin", "");
      if (result.success == false) {
        console.log("Cannot Reset Identities");
        result = await createUserRequest("super", "admin");
        userContent = await getUserContent();
        return "";
      }    
    }

    //Set klaveServer identity
    success = await resetIdentities();

    //Get token identity
    let publicKeys = await getPublicKeys();
    let klaveServerKeyName = await importPublicKey(publicKeys.klaveServerPublicKey);

    //Create a sharedLedger
    sharedLedgerId = await createSharedLedger();

    //Check the sharedLedger was actually created
    let shared_ledgers = await listSharedLedgers();
    let found = await shared_ledgers.includes(sharedLedgerId);
    console.assert(found, "SharedLedger not found");

    let sharedLedgerContent = await getSharedLedgerContent(sharedLedgerId);
    console.assert(sharedLedgerContent, "Error getting sharedLedger content");

    userContent = await getUserContent();
    console.assert(userContent.roles.length > 0, "Error getting user content");
  }
  klaveCloseConnection();  

  return [sharedLedgerId];
}

const testAddTrade = async (user, sharedLedgerId, role, jurisdiction, buyer, buyerCountry, seller, sellerCountry, asset, quantity, price, tradeDate) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let result = false;
  if (user_connected) {    
    
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");

      let success = await addUserNoAppovalNeeded(sharedLedgerId, role, jurisdiction);
      if (success == false) {
        console.error("Error creating user request");
        return false;
      }    
      userContent = await getUserContent();
      if (!userContent) {
        console.error("Error getting user content");
        return false;
      }
    }    
    if (userContent.roles.length == 0) {
      console.error("No roles found");
      return false;
    }
    if (userContent.roles[0].sharedLedgerId != sharedLedgerId) {
      console.error("User not associated with sharedLedger");
      return false;
    }
    result = await submitTrade(sharedLedgerId, buyer, buyerCountry, seller, sellerCountry, asset, quantity, price, tradeDate, jurisdiction);
    console.assert(result, "Error submitting trade");

    let sharedLedgerContent = await getSharedLedgerContent(sharedLedgerId);
    console.assert(sharedLedgerContent, "Error getting sharedLedger content");

  }
  klaveCloseConnection();    

  return result;
}

const testAddMetadata = async (user, sharedLedgerId, role, jurisdiction, publicData, metadata) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {    
    
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");

      let success = await addUserNoAppovalNeeded(sharedLedgerId, role, jurisdiction);
      if (success == false) {
        console.error("Error creating user request");
        return;
      }    
      userContent = await getUserContent();
      if (!userContent) {
        console.error("Error getting user content");
        return;
      }
    }    
    if (userContent.roles.length == 0) {
      console.error("No roles found");
      return;
    }
    if (userContent.roles[0].sharedLedgerId != sharedLedgerId) {
      console.error("User not associated with sharedLedger");
      return;
    }

    let tradeIds = await getAllTrades(sharedLedgerId);

    for (let i = 0; i < tradeIds.length; i++) {
      let UTI = tradeIds[i].UTI;
      let tokenB64 = tradeIds[i].tokenB64;      

      result = await addMetadata(sharedLedgerId, UTI, tokenB64, publicData, metadata);
    }
  }
  klaveCloseConnection();    
}

const testMatchTradeDetails = async (user, sharedLedgerId, role, jurisdiction, buyerName, buyerCountry, sellerName, sellerCountry ) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {    
    
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");

      let success = await addUserNoAppovalNeeded(sharedLedgerId, role, jurisdiction);
      if (success == false) {
        console.error("Error creating user request");
        return;
      }    
      userContent = await getUserContent();
      if (!userContent) {
        console.error("Error getting user content");
        return;
      }
    }    
    if (userContent.roles.length == 0) {
      console.error("No roles found");
      return;
    }
    if (userContent.roles[0].sharedLedgerId != sharedLedgerId) {
      console.error("User not associated with sharedLedger");
      return;
    }

    let success = true;
    let tradeIds = await getAllTrades(sharedLedgerId);
    for (let i = 0; i < tradeIds.length; i++) {
      let UTI = tradeIds[i].UTI;
      let tokenB64 = tradeIds[i].tokenB64;      

      let results = [];
      results[0] = await exactMatch(sharedLedgerId, UTI, tokenB64, "buyerName", buyerName);
      results[1] = await exactMatch(sharedLedgerId, UTI, tokenB64, "buyerCountry", buyerCountry);
      results[2] = await exactMatch(sharedLedgerId, UTI, tokenB64, "sellerName", sellerName);
      results[3] = await exactMatch(sharedLedgerId, UTI, tokenB64, "sellerCountry", sellerCountry);

      for (let i = 0; i < results.length; i++) {
        success = success && results[i].success;
      }
    }

    return success;
  }
  klaveCloseConnection();    
}

const testApproveRequests = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {
    let userContent = await getUserContent();

    let requests = await listUserRequests();

    if (!requests) {
      console.error("No requests to approve");
      return;
    }

    for (let i = 0; i < requests.length; i++) {
      let request = requests[i];
      let approveRequestInput = {
        "userRequestId": request,
      };
      let result = await klaveTransaction(fqdn, "approveUserRequest", approveRequestInput);
      console.assert(result.success, "Error approving request");
    }
  }
  klaveCloseConnection();  
}

const testQueryInfo = async (user, sharedLedgerId, UTI, tokenB64) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");
      return;
    }    
    if (userContent.roles.length == 0) {
      console.error("No roles found");
      return;
    }
    if (userContent.roles[0].sharedLedgerId != sharedLedgerId) {
      console.error("User not associated with sharedLedger");
      return;
    }
    let result = await getTradeInfo(sharedLedgerId, UTI, tokenB64);
  }
  klaveCloseConnection();  
}

const testAudit = async (user, sharedLedgerId, role, jurisdiction, trades) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");

      let success = await addUserNoAppovalNeeded(sharedLedgerId, role, jurisdiction);
      if (success == false) {
        console.error("Error creating user request");
        return;
      }    
      userContent = await getUserContent();
      if (!userContent) {
        console.error("Error getting user content");
        return;
      }
    }    
    if (userContent.roles.length == 0) {
      console.error("No roles found");
      return;
    }
    if (userContent.roles[0].sharedLedgerId != sharedLedgerId) {
      console.error("User not associated with sharedLedger");
      return;
    }
    let result = await getMultipleTradeInfo(sharedLedgerId, trades);
  }
  klaveCloseConnection();  
}

module.exports = {
    deploySharedLedger,
    clearSharedLedgerApp,
    testSharedLedger,
    testAddTrade,
    testAddMetadata,
    testMatchTradeDetails,
    testApproveRequests,
    testQueryInfo,
    testAudit,    
}
