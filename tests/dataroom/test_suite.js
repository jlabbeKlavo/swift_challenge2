const fs = require('fs');
const { subtle_GenerateKey, subtle_ExportPublicKey, subtle_Hash, subtle_Sign, subtle_Verify } = require('./subtle');
const { klaveDeployApp, klaveTransaction, klaveQuery, klaveCloseConnection, klaveOpenConnection } = require('../../klave_network');
const { base64ToArrayBuffer, arrayBufferToBase64 } = require('../../utils');
const { setStorageServerTokenIdentity, importPublicKey, sign, verify } = require('./test_sdk');

//wasm to deploy must be copied post generation coming from yarn build command
const app_id = "test_dataroom";
const fqdn = "test_dataroom_smart_contract_jeremie_6";
const WASM_TEST_DATAROOM = './config/wasm/shared_ledger.b64';

const deployDataRoom = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    let result = await klaveDeployApp(app_id, fqdn, WASM_TEST_DATAROOM);
  }
  klaveCloseConnection();
}

const clearDataRoomApp = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    let result = await klaveTransaction(fqdn, "clearAll", "");
  }
  klaveCloseConnection();
}

const createDataRoom = async () => {    
  let drInput = {
    "dataRoomId": "",
  };
  let result = await klaveTransaction(fqdn,"createDataRoom", drInput);
  return result.message.split(":")[1].trim();
}

const listDataRooms = async () => {
  let result = await klaveTransaction(fqdn,"listDataRooms", "");
  return result.result;
}

const getDataRoomContent = async (dataRoomId) => {
    let drInput = {
      "dataRoomId": dataRoomId,
    };
    let result = await klaveTransaction(fqdn,"getDataRoomContent", drInput);
  return result.result;
}

const getUserContent = async () => {
  let result = await klaveTransaction(fqdn,"getUserContent", "");
  return result.result;
}

const getFileUploadToken = async (dataRoomId, digestB64, klaveServerKeyName) => {
    //Storage Server asks signature from KlaveServer
    let getFileUploadTokenInput = {
      "dataRoomId": dataRoomId,
      "digestB64": digestB64,
    };
  
    let result = await klaveTransaction(fqdn,"getFileUploadToken", getFileUploadTokenInput);
    if (result.success == false) {
      console.error("Error getting token from klaveServer");
      return false;
    }
    
    let token = await base64ToArrayBuffer(result.result.tokenB64);
    let tokenBody = new Uint8Array(token.byteLength - 64);
    tokenBody.set(new Uint8Array(token, 0, token.byteLength - 64), 0);

    let tokenBodyB64 = await arrayBufferToBase64(tokenBody);

    let tokenSignature = new Uint8Array(64);
    tokenSignature.set(new Uint8Array(token, token.byteLength - 64, 64), 0);

    let tokenSignatureB64 = await arrayBufferToBase64(tokenSignature);

    //Storage Server verifies signature
    let verified = await verify(klaveServerKeyName, tokenBodyB64, tokenSignatureB64);
    console.assert(verified , "Error verifying signature");
    return true;
}

const updateDataRoom = async (dataRoomId, fileName, digestB64, storageServerPrivKey) => {
  //Token is a b64 concatenation between the file digest, the time and the signature of the couple {file digest, time}
  let time = new Date().getTime();
  let timeBuffer = new ArrayBuffer(8);
  let timeView = new DataView(timeBuffer);
  timeView.setBigInt64(0, BigInt(time), true);


  let digest = base64ToArrayBuffer(digestB64);
  let tokenSign = new Uint8Array(digest.byteLength + timeBuffer.byteLength);

  tokenSign.set(new Uint8Array(digest), 0);
  tokenSign.set(new Uint8Array(timeBuffer), digest.byteLength);
  let tokenSignB64 = arrayBufferToBase64(tokenSign);

  let signatureB64 = await sign(storageServerPrivKey, tokenSignB64);
  let signature = base64ToArrayBuffer(signatureB64);

  let token = new Uint8Array(digest.byteLength + timeBuffer.byteLength + signature.byteLength);
  token.set(new Uint8Array(digest), 0);
  token.set(new Uint8Array(timeBuffer), digest.byteLength);
  token.set(new Uint8Array(signature), digest.byteLength + timeBuffer.byteLength);  

  let tokenB64 = arrayBufferToBase64(token);

  let updateDRInput = {
    "dataRoomId": dataRoomId,
    "operation": "addFile",
    "file": {
      "name": fileName,
      "digestB64": digestB64,
      "type": "",
      "key": "",
      "tokenB64": tokenB64
    }
  };

  result = await klaveTransaction(fqdn,"updateDataRoom", updateDRInput);
  return result.success;
}

const resetIdentities = async () => {
  let resetIdentitiesInput = {
    "resetKlaveServer": true,
    "resetStorageServer": true,
  };
  let result = await klaveTransaction(fqdn, "resetIdentities", resetIdentitiesInput);
  return result.success;  
}

const exportStorageServerPrivateKey = async () => {
  let exportInput = {
    "format": "pkcs8",
  };
  let result = await klaveTransaction(fqdn, "exportStorageServerPrivateKey", exportInput);
  return result.message;
}

const getPublicKeys = async () => {
  let result = await klaveQuery(fqdn, "getPublicKeys", "");  
  return result.result;
}

const createUserRequest = async (dataRoomId, role) => {
  let createUserRequestInput = {
    "dataRoomId": dataRoomId,
    "role": role,
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

const testDataRoom = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let storageServerKeyName = "";
  let dataRoomId = "";
  if (user_connected) {
    let userContent = await getUserContent();
    if (userContent && userContent.roles.length > 0 &&
      userContent.roles[0].dataRoomId == "super" && userContent.roles[0].role == "admin") {

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

    //Create crypto keyPairs with subtle
    let storageServerPrivateKey = await exportStorageServerPrivateKey();    
    
    //Set storageServer identity
    storageServerKeyName = await setStorageServerTokenIdentity(storageServerPrivateKey);

    //Get token identity
    let publicKeys = await getPublicKeys();
    let klaveServerKeyName = await importPublicKey(publicKeys.klaveServerPublicKey);

    //Create a sharedLedger
    dataRoomId = await createDataRoom();

    //Check the sharedLedger was actually created
    let datarooms = await listDataRooms();
    let found = await datarooms.includes(dataRoomId);
    console.assert(found, "SharedLedger not found");

    //Add a file to the sharedLedger
    let fileName = "some_secret_file.txt"
    let digestB64 = await createFileDigest('./config/exampleFiles/' + fileName);

    //Ask the klaveServer for a token
    success = await getFileUploadToken(dataRoomId, digestB64, klaveServerKeyName);

    //Update the sharedLedger with the new file
    success = await updateDataRoom(dataRoomId, fileName, digestB64, storageServerKeyName);
    console.assert(success, "Error updating sharedLedger with new file");

    let dataRoomContent = await getDataRoomContent(dataRoomId);

    userContent = await getUserContent();
  }
  klaveCloseConnection();  

  return [storageServerKeyName, dataRoomId];
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

const testAddFile = async (user, dataRoomId, storageServerKeyName) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  if (user_connected) {    
    
    let userContent = await getUserContent();

    //Get token identity
    let tokenIdentity = await getPublicKeys();
    let klaveServerKeyName = await importPublicKey(tokenIdentity.klaveServerPublicKey);

    //Add a file to the sharedLedger
    let fileName = "some_other_secret_file.txt"
    let digestB64 = await createFileDigest('./config/exampleFiles/' + fileName);

    //Ask the klaveServer for a token
    let success = await getFileUploadToken(dataRoomId, digestB64, klaveServerKeyName);
    if (success == false) {
      console.error("Error exporting StorageServerPrivateKey");
      await createUserRequest(dataRoomId, "user");
      return;
    }    

    //Update the sharedLedger with the new file
    success = await updateDataRoom(dataRoomId, fileName, digestB64, storageServerKeyName);
    console.assert(success, "Error updating sharedLedger with new file");

    let dataRoomContent = await getDataRoomContent(dataRoomId);
  }
  klaveCloseConnection();    
}

module.exports = {
    deployDataRoom,
    clearDataRoomApp,
    testDataRoom,
    testAddFile,
    testApproveRequests,
}
