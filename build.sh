echo building pkmultisig.wasm from AssemblyScript...
pushd assembly
yarn install
yarn run asbuild
base64 -w 0 .klave/0-shared_ledger.wasm > ../config/wasm/shared_ledger.b64
popd
echo done
