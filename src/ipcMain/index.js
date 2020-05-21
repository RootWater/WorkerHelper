const files = require.context('./', false, /(?<!index|tools|translate|temp)(\.js)$/);
const Methods = {};

files.keys().forEach(key => {
    Methods[key.replace(/(\.\/|\.js)/g, '')] = files(key).default;
});

export default Methods;
