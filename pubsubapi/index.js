const http = require('http');
const port = process.env.PORT || 5001;
const app = require('./app');
const server = http.createServer(app);
server.listen(port, () => {
    console.log("satrting server at http://localhost:"+port);
})