cd the-utilities\ts
call npm version patch
call npm run build
call npm publish

cd ..\..
call npm install @the-coin/utilities