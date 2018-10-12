setlocal
cd the-contract
yarn
yarn link
endlocal

setlocal
cd the-pricing\ClientJS
yarn
yarn link
endlocal

setlocal
cd tapcap-manager\ClientJS
yarn
yarn link
yarn link the-contract
endlocal

setlocal
cd broker-cad\ClientJS
yarn
yarn link
yarn link the-contract
endlocal

setlocal
cd the-utilities\js
yarn
yarn link
yarn link the-contract
endlocal

setlocal
cd the-website
yarn link "the-pricing"
yarn link "tapcap-manager"
yarn link "the-broker-cad"
yarn link "the-contract"
yarn link "the-utilities"
endlocal