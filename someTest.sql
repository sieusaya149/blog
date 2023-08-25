START TRANSACTION;

INSERT INTO USER (userId, userName, email, password, birthDay) VALUES (UUID(), 'hunghoang123423', 'hung', '1231513', NOW());
SELECT @lastestUserId:=userId FROM USER WHERE email='hung';
INSERT INTO KEYSTORE (keyStoreId, publicKey, privateKey, accessToken, refreshToken, userId)
       VALUES (UUID(),'123123', '12315123', 'asdasdad', 'qweqweqdadas', @lastestUserId);
ROLLBACK;

START TRANSACTION;

INSERT INTO USER (userId, userName, email, password, birthDay) VALUES (UUID(), 'hunghoang123423', 'hung', '1231513', NOW());
SELECT @lastestUserId:=userId FROM USER WHERE email='hung';
INSERT INTO KEYSTORE (keyStoreId, publicKey, privateKey, accessToken, refreshToken, userId)
       VALUES (UUID(),'123123', '12315123', 'asdasdad', 'qweqweqdadas', @lastestUserId);
COMMIT;