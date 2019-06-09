cd types
call npm run build
call npm version patch
call npm publish

cd ..
call npm install @the-coin/types