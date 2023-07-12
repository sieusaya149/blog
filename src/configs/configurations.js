 

const DB_QUERYs = {
    CREATE_USER_TABLE : "CREATE TABLE IF NOT EXISTS USER(\
                        userId CHAR(36),\
                        userName VARCHAR(255) UNIQUE NOT NULL,\
                        email VARCHAR(255) UNIQUE NOT NULL,\
                        password VARCHAR(255) UNIQUE NOT NULL,\
                        bio LONGTEXT DEFAULT NULL,\
                        birthDay DATE,\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        PRIMARY KEY(userId));",
    
    CREATE_POST_TABLE : "CREATE TABLE IF NOT EXISTS POST(\
                        postId CHAR(36),\
                        title VARCHAR(1500) NOT NULL,\
                        statusEdit ENUM('draf', 'publish', 'unpublist') DEFAULT 'draf',\
                        sharePermission ENUM('private', 'follower', 'public'),\
                        summarize TEXT NOT NULL,\
                        content LONGTEXT NOT NULL,\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        userId CHAR(36),\
                        categroryId CHAR(36),\
                        PRIMARY KEY (postId),\
                        FOREIGN KEY (userId) REFERENCES USER(userId),\
                        FOREIGN KEY (categroryId) REFERENCES CATEGORY(categroryId));",
    
    CREATE_CATEGORY_TABLE: "CREATE TABLE IF NOT EXISTS CATEGORY(\
                            categroryId CHAR(36),\
                            categroryName VARCHAR(1500) NOT NULL,\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                            PRIMARY KEY (categroryId));",
    
    CREATE_TAG_TABLE: "CREATE TABLE IF NOT EXISTS TAG(\
                        tagId CHAR(36),\
                        tagName VARCHAR(1500) NOT NULL,\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        PRIMARY KEY (tagId));",

    CREATE_POSTTAG_TABLE: "CREATE TABLE IF NOT EXISTS POSTTAG(\
                            tagId CHAR(36),\
                            postId CHAR(36),\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                            FOREIGN KEY (tagId) REFERENCES TAG(tagId),\
                            FOREIGN KEY (postId) REFERENCES POST(postId));",

    CREATE_POSTCATEGORY_TABLE: "CREATE TABLE IF NOT EXISTS POSTCATEGORY(\
                                categroryId CHAR(36),\
                                postId CHAR(36),\
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                FOREIGN KEY (categroryId) REFERENCES CATEGORY(categroryId),\
                                FOREIGN KEY (postId) REFERENCES POST(postId));",
    
    CREATE_APIKEY_TABLE : "CREATE TABLE IF NOT EXISTS APIKEY(\
                            id int AUTO_INCREMENT PRIMARY KEY,\
                            keyString VARCHAR(255) UNIQUE NOT NULL,\
                            permission ENUM('admin', 'user') DEFAULT 'user',\
                            is_active BOOLEAN DEFAULT TRUE,\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);",

    
    CREATE_KEY_STORE_TABLE : "CREATE TABLE IF NOT EXISTS KEYSTORE(\
                            keyStoreId CHAR(36),\
                            publicKey VARCHAR(255) UNIQUE NOT NULL,\
                            privateKey VARCHAR(255) UNIQUE NOT NULL,\
                            accessToken VARCHAR(255) UNIQUE NOT NULL,\
                            refreshToken VARCHAR(255) UNIQUE NOT NULL,\
                            refreshTokenUsed JSON DEFAULT NULL,\
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                            userId CHAR(36),\
                            PRIMARY KEY(keyStoreId),\
                            FOREIGN KEY (userId) REFERENCES USER(userId));",
    
    CREATE_IMAGE_TABLE: "CREATE TABLE IF NOT EXISTS IMAGE(\
                        imageId CHAR(36),\
                        imageUrl CHAR(255) NOT NULL,\
                        topic ENUM('avatar', 'thumnail', 'content') DEFAULT 'content',\
                        postId CHAR(36),\
                        userId CHAR(36),\
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                        FOREIGN KEY (postId) REFERENCES POST(postId),\
                        FOREIGN KEY (userId) REFERENCES USER(userId));",

    CREATE_VERIFY_CODE_TABLE:  "CREATE TABLE IF NOT EXISTS VERIFYCODE(\
                                    codeId CHAR(36),\
                                    code VARCHAR(255) UNIQUE NOT NULL,\
                                    expireTime TIMESTAMP NOT NULL, \
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
                                    userId CHAR(36),\
                                    PRIMARY KEY(codeId),\
                                    FOREIGN KEY (userId) REFERENCES USER(userId)\
                                );"
}

const API = {
    API_KEY: "8da9be05-6d98-4c2f-ab9e-f1e76a43af01"
}

const TIMEOUT = {
    verifyCode : 60 * 60  *  1000
}


module.exports = { DB_QUERYs, TIMEOUT}