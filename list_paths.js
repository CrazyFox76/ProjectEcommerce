const fs = require('fs');
const openapi = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));

const paths = Object.keys(openapi.paths);
console.log("All paths in OpenAPI spec:");
paths.forEach(p => console.log(p));
