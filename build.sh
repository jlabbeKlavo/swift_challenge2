echo building sharedLedger.wasm from AssemblyScript...
pushd assembly
yarn install
yarn run asbuild
base64 -w 0 .klave/0-sharedledger.wasm > ../config/wasm/shared_ledger.b64
popd
echo done
