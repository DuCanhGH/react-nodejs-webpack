module.exports = function (api) {
    api.cache(true);
    const presets = [
        [
            "@babel/preset-env",
            {
                "loose": true,
                "modules": false
            }
        ],
        [
            "@babel/react",
            {
                "runtime": "automatic"
            }
        ],
        "@babel/preset-typescript"
    ];
    const plugins = [];
    return {
        presets,
        plugins
    };
};