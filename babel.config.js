module.exports = function (api) {
    api.cache(true);
    const presets = [
        "@babel/preset-env",
        "@babel/react",
        "@babel/preset-typescript"
    ];
    const plugins = [];
    return {
        presets,
        plugins
    };
};