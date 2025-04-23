import * as jose from 'jose';
import fs from 'fs/promises';
import * as path from 'path';

const numKeys = 3;
let keyPairs = [];
for (let i = 0; i < numKeys; i++) {
  const keyPair = await jose.generateKeyPair('ES256', { extractable: true });

  const publicJwk = await jose.exportJWK(keyPair.publicKey);
  const privateJwk = await jose.exportJWK(keyPair.privateKey);

  const kid = await jose.calculateJwkThumbprint(publicJwk);
  privateJwk.kid = kid;
  privateJwk.alg = 'ES256';
  privateJwk.use = 'sig';
  publicJwk.kid = kid;
  publicJwk.alg = 'ES256';
  publicJwk.use = 'sig';

  keyPairs.push({ publicJwk, privateJwk });
  console.log(`Generated keypair ${i + 1}: kid ${kid}`);
}

const libDir = path.join(process.cwd(), 'app/api/bluesky/auth/jwks.json');
const publicJwksPath = path.join(libDir, 'jwks.json');
await fs.writeFile(
  publicJwksPath,
  JSON.stringify({ keys: keyPairs.map((pair) => pair.publicJwk) }, null, 2)
);

console.log(`\n--- Public JWKS keys saved to ${publicJwksPath} ---`);

keyPairs
  .map((pair) => pair.privateJwk)
  .forEach((key, index) => {
    console.log(`JWT_PRIVATE_KEY_${index + 1}='${JSON.stringify(key)}'`);
  });

// const key: JoseKey = await JoseKey.generate(['ES256'], `key-${randomUUID()}`);
// let key2 = await JoseKey.generateKeyPair();

// console.log(key);
// console.log(key2);
// let privateKey = await JoseKey.fromKeyLike(key2.privateKey);
// let publicKey = await JoseKey.fromKeyLike(key2.publicKey);
// const kid = `key-${randomUUID()}`;
// console.log(privateKey);
// console.log(publicKey);
// const privateJwk = await JoseKey.fromImportable(key);
// const publicJwk = await key.publicJwk!;

// // Create JWKS structure containing ONLY the public key
// // const jwks: JwkWithAlg = { keys: [publicJwk] };

// console.log(
//   `\n--- Private JWK (Save securely as OAUTH_PRIVATE_JWK env var) ---`
// );
// console.log(JSON.stringify(privateJwk)); // Output the full private JWK object

// // Save the public JWKS to a file accessible by the web server
// await fs.writeFile('./public/jwks.json', JSON.stringify(publicJwk, null, 2));
// console.log(`\n--- Public JWKS saved to./public/jwks.json ---`);
// console.log(JSON.stringify(publicJwk, null, 2)); // Output the public JWKS content
