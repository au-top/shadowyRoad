rm ./build -rf&&
npx tsc &&
mkdir ./build/dist/
cp ./src/config.json ./build/config.json
cp ./src/config.json ./build/dist/config.json
(
    npx webpack ./build/udpO.js --target=node --output-path=./build/dist/ --output-filename=uO.js --mode=production  --config=./webpack.config.js
    npx webpack ./build/udpOl.js --target=node --output-path=./build/dist/ --output-filename=uOl.js --mode=production --config=./webpack.config.js
)
