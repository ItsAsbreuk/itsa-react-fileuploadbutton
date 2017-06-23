module.exports = {
    entry: "./app.js",
    output: {
        path: "./examples",
        filename: "mainapp.js" // Template based on keys in entry above
    },
    externals: [
        {
            "../externals/react-fiber/build/packages/react/umd/react.production.min.js": "React"
        },
        {
            "../externals/react-fiber/build/packages/react-dom/umd/react-dom.production.min.js": "ReactDOM"
        }
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                query: {
                    presets: ["react", "es2015"]
                }
            },
            {
                test: /\.s?css$/,
                loader: "style-loader!css-loader!sass-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.svg/,
                loader: "url-loader"
            }
        ]
    }
};
