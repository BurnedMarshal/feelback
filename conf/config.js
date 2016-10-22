const config = {
    development: {
        database: process.env.DATABASE || 'http://localhost:7474',
        username: process.env.USERNAME || 'neo4j',
        password: process.env.PASSWD || 'neo',
        secret: '94611ba5cbe7686d886bb27aa8162964'
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
