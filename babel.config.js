module.exports = function (api) {
    api.cache(true);
    const presets = [
        "@babel/preset-env",
        "@babel/react",
    ];
    const plugins = [];
    return {
        presets,
        plugins
    };
};