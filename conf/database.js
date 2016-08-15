const config = {
    database: process.env.DATABASE || 'http://localhost:7474',
    username: process.env.USERNAME || 'neo4j',
    password: process.env.PASSWD || 'neo'
};

module.exports = config;
