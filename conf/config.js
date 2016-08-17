const config = {
    development: {
        database: process.env.DATABASE || 'http://localhost:7474',
        username: process.env.USERNAME || 'neo4j',
        password: process.env.PASSWD || 'neo',
        secret: 'c1ad7fde3a183d38d09f985b08247f5f'
    },
    stage: {
        database: process.env.DATABASE || 'http://localhost:7474',
        username: process.env.USERNAME || 'neo4j',
        password: process.env.PASSWD || 'neo',
        secret: process.env.SECRET
    },
    production: {
        database: process.env.DATABASE || 'http://localhost:7474',
        username: process.env.USERNAME || 'neo4j',
        password: process.env.PASSWD || 'neo',
        secret: process.env.SECRET
    }
};

const ENV = process.env.NODE_ENV || 'development';

module.exports = config[ENV];
