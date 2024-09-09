const fs = require('fs');
const { klaveDeployApp, klaveTransaction, klaveCloseConnection, klaveOpenConnection } = require('../../klave_network');
const { rmPemDecorators } = require('../../utils');

//wasm to deploy must be copied post generation coming from yarn build command
const app_id = "test_sdk";
const fqdn = "test_sdk_smart_contract";
const WASM_TEST_SDK = './config/wasm/testklavesdk.b64';

const deployTestSDK = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    await klaveDeployApp(app_id, fqdn, WASM_TEST_SDK);
  }
  klaveCloseConnection();
}

const setStorageServerTokenIdentity = async (pem) => {
  let pemContents = await rmPemDecorators(pem, "EC PRIVATE");    

  let importKeyInput = {
    "keyName":"storageServerPrivateKey",
    "key": {
      "format":"pkcs8",
      "keyData":pemContents,
      "algorithm":"secp256r1",
      "extractable": false,
      "usages": ["sign"]
    }
  };

  let result = await klaveTransaction(fqdn,"importKey", importKeyInput);
  return result.message;
}

const importPublicKey = async (pem) => {
  let pemContents = await rmPemDecorators(pem, "PUBLIC");    

  let importKeyInput = {
    "keyName":"klaveServerPublicKey",
    "key": {
      "format":"spki",
      "keyData":pemContents,
      "algorithm": "secp256r1",
      "extractable": true,
      "usages": ["verify"]
    }
  };

  let result = await klaveTransaction(fqdn, "importKey", importKeyInput);
  return result.message;
}

const getPublicKey = async (keyName) => {
  let getPublicKeyInput = {
    "keyName":keyName,
    "format":"spki"
  };
  let result = await klaveTransaction(fqdn,"getPublicKey", getPublicKeyInput);
  return result.message;
}

const sign = async (keyName, clearText) => {
  let signInput = {
    "keyName":keyName,
    "clearText":clearText
  };
  result = await klaveTransaction(fqdn,"sign", signInput);
  return result.message;
}

const verify = async (keyName, clearText, signatureB64) => {
  let verifyInput = {
    "keyName":keyName,
    "clearText":clearText,
    "signatureB64":signatureB64
  };
  result = await klaveTransaction(fqdn,"verify", verifyInput);
  return result.success;
}

module.exports = {
  deployTestSDK,
  setStorageServerTokenIdentity,
  importPublicKey,
  getPublicKey,
  sign,
  verify
}
