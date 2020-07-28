npx tsc &&
mkdir ./build/dist/
cp ./src/config.json ./build/config.json
cp ./src/config.json ./build/dist/config.json
(
    npx webpack ./build/O.js --target=node --output-path=./build/dist/ --output-filename=O.js --mode=production  --config=./webpack.config.js
    npx webpack ./build/Ol.js --target=node --output-path=./build/dist/ --output-filename=Ol.js --mode=production --config=./webpack.config.js
)
