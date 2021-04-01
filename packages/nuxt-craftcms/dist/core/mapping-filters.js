export default (context) => ({
    options: context.app.$craftcms.options,
    // Deep access to properties
    get(obj, ...props) {
        return obj && props.reduce((result, prop) => result == null ? undefined : result[prop], obj);
    },
    // Remove hostname
    getPathName(str) {
        if (!str) {
            return '';
        }
        return str.replace(this.options.appBaseUrl, '');
    },
    // Add beginning and trailing slash
    formatURI(str) {
        return `/${str}/`;
    }
});
