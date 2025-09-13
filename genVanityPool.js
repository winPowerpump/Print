import { Keypair } from '@solana/web3.js';
import fs from 'fs';

const SUFFIX = 'print';
const POOL_SIZE = 1000;
const pool = [];

console.log(`Generating ${POOL_SIZE} vanity addresses ending with "${SUFFIX}"...`);

while (pool.length < POOL_SIZE) {
  const keypair = Keypair.generate();
  const pubkeyStr = keypair.publicKey.toBase58();

  if (pubkeyStr.endsWith(SUFFIX)) {
    pool.push({
      publicKey: pubkeyStr,
      secretKey: keypair.secretKey.toString('base64'),
    });
    console.log(`Found ${pool.length}/${POOL_SIZE}: ${pubkeyStr}`);
  }
}

// Save to file
fs.writeFileSync('vanityPool.json', JSON.stringify(pool, null, 2));
console.log('Vanity pool saved to vanityPool.json');
