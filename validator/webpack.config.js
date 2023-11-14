const path = require('path');

module.exports = {
  // possible values:
  //   production
  //   development
  mode: "production",

  // inline-source-map  -> Possible choice when publishing a single file
  // (none)             -> Recommended choice for production builds with maximum performance.
  devtool: "nosources-source-map",
  target: "node",
  entry: {
    main: "./src/validator.ts",
    devmatch: "./src/index.ts",
  },
  output: {
    library: 'mylib',
    path: path.resolve(__dirname, './dist'),
    filename: "[name]-bundle.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};
