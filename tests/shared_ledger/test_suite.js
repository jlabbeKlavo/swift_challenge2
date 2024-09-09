const fs = require('fs');
const { subtle_Hash } = require('./subtle');
const { klaveDeployApp, klaveTransaction, klaveQuery, klaveCloseConnection, klaveOpenConnection } = require('../../klave_network');
const { arrayBufferToBase64 } = require('../../utils');
const { importPublicKey } = require('./test_sdk');

//wasm to deploy must be copied post generation coming from yarn build command
const app_id = "test_shared_ledger";
const fqdn = "test_shared_ledger_smart_contract_jeremie_7";
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

const submitTrade = async (sharedLedgerId, buyer, seller, asset, quantity, price, tradeDate) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": "",
    "buyer": buyer,
    "seller": seller,
    "asset": asset,
    "quantity": quantity,
    "price": price,
    "tradeDate": tradeDate
  };  

  let result = await klaveTransaction(fqdn,"submitTrade", drInput);
  return result;
}

const confirmTrade = async (sharedLedgerId, UTI, tokenB64, confirmationStatus) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "confirmationStatus": confirmationStatus
  };  

  let result = await klaveTransaction(fqdn,"confirmTrade", drInput);
  return result;
}

const transferAsset = async (sharedLedgerId, UTI, tokenB64, transferStatus) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "transferStatus": transferStatus
  };  

  let result = await klaveTransaction(fqdn,"transferAsset", drInput);
  return result;
}

const settleTrade = async (sharedLedgerId, UTI, tokenB64, settlementStatus) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64,
    "transferStatus": settlementStatus
  };  

  let result = await klaveTransaction(fqdn,"settleTrade", drInput);
  return result;
}

const queryInfo = async (sharedLedgerId, UTI, tokenB64) => {
  let drInput = {
    "SLID": sharedLedgerId,
    "UTI": UTI,
    "tokenB64": tokenB64    
  };  

  let result = await klaveTransaction(fqdn,"queryInfo", drInput);
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

const createFileDigest = async (filepath) => {
    //Create a digest of the file defined by filepath
    let file = null;
    try {
      file = fs.readFileSync(filepath);
    }
    catch (err) {
      console.error("Error reading file: ", err);
      return;
    }
  
    let digest = await subtle_Hash(file);
    let digestB64 = arrayBufferToBase64(digest);
    return digestB64;
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

const testAddTrade = async (user, sharedLedgerId, role, jurisdiction, buyer, seller, asset, quantity, price, tradeDate) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let UTI = "";
  let tokenB64 = "";
  if (user_connected) {    
    
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");

      let success = await createUserRequest(sharedLedgerId, role, jurisdiction);
      if (success == false) {
        console.error("Error creating user request");
        return;
      }    
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
    let result = await submitTrade(sharedLedgerId, buyer, seller, asset, quantity, price, tradeDate);
    if (result.result.status == "success") {
      UTI = result.result.UTI;
      tokenB64 = result.result.tokenB64;
    }

    let sharedLedgerContent = await getSharedLedgerContent(sharedLedgerId);
    console.assert(sharedLedgerContent, "Error getting sharedLedger content");

  }
  klaveCloseConnection();    

  return [UTI, tokenB64];
}

const testConfirmTrade = async (user, sharedLedgerId, role, jurisdiction, UTI, tokenB64, confirmationStatus) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {    
    
    let userContent = await getUserContent();
    if (!userContent) {
      console.error("Error getting user content");

      let success = await createUserRequest(sharedLedgerId, role, jurisdiction);
      if (success == false) {
        console.error("Error creating user request");
        return;
      }    
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
    let result = await confirmTrade(sharedLedgerId, UTI, tokenB64, confirmationStatus);
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
    let result = await queryInfo(sharedLedgerId, UTI, tokenB64);
  }
  klaveCloseConnection();  
}

module.exports = {
    deploySharedLedger,
    clearSharedLedgerApp,
    testSharedLedger,
    testAddTrade,
    testConfirmTrade,
    testApproveRequests,
    testQueryInfo,
}
