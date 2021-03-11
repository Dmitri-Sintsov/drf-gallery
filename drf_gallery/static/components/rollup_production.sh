rm bundle.*
rollup main.js --format es --config rollup.terser.config.js --sourcemap true --name MainBundle --file bundle.js
