const { composePlugins, withNx } = require('@nx/webpack');

class ESMLoader {
	static defaultOptions = {
	  esmPackages: "all"
	};
  
	constructor(options = {}) {
	  this.options = { ...ESMLoader.defaultOptions, ...options };
	}
  
	apply(compiler) {
	  compiler.hooks.compilation.tap(
		"ECMAScript Module (ESM) Loader. Turns require() into import()",
		(
		  compilation
		) => {
		  compilation.hooks.buildModule.tap("Hello World Plugin", (module) => {
			  if (
				module.type === "javascript/dynamic" &&
				(
				  this.options.esmPackages === "all" ||
				  this.options.esmPackages.includes(module.request)
				)
			  ) {
				// All types documented at
				// https://webpack.js.org/configuration/externals/#externalstype
				module.externalType = "import";
			  }
			}
		  )
		  ;
		}
	  );
	}
  }
  

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.target = "node16";
  config.plugins.push(new ESMLoader({ esmPackages: ["ol/geom/LineString.js", "got"] }))
  return config;
});
