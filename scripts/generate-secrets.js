const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateSecrets() {
    // 生成密码哈希
    const password = 'Lkm76@#21';  // 您的密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 生成JWT密钥
    const jwtSecret = crypto.randomBytes(32).toString('hex');

    console.log('Generated secrets:');
    console.log('==================');
    console.log('Password Hash:', passwordHash);
    console.log('JWT Secret:', jwtSecret);
}

generateSecrets().catch(console.error); 