/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
chai.should();
const {expect} = chai;

import {
  Ed25519VerificationKey2018
} from '@digitalbazaar/ed25519-verification-key-2018';
import {X25519KeyAgreementKey2019} from '../../';
import {encode} from 'base58-universal';

const mockKey = {
  publicKeyBase58: '8y8Q4AUVpmbm2VrXzqYSXrYcAETrFgX4eGPJoKrMWXNv',
  privateKeyBase58: '95tmYuhqSuJqY77FEg78Zy3LFQ1cENxGv2wMvayk7Lqf'
};

describe('X25519KeyAgreementKey2019', () => {
  describe('class vars', () => {
    it('should expose suite id for crypto-ld usage', async () => {
      expect(X25519KeyAgreementKey2019.suite)
        .to.equal('X25519KeyAgreementKey2019');
    });
  });

  describe('constructor', () => {
    it('should auto-set key.id based on controller, if present', async () => {
      const {publicKeyBase58} = mockKey;
      const controller = 'did:example:1234';

      const keyPair = new X25519KeyAgreementKey2019({controller, publicKeyBase58});
      expect(keyPair.id).to.equal(
        'did:example:1234#z6LSjeJZaUHMvEKW7tEJXV4PrSm61NzxxHhDXF6zHnVtDu9g');
    });

    it('should error if publicKeyBase58 property is missing', async () => {
      let error;
      try {
        new X25519KeyAgreementKey2019({});
      } catch(e) {
        error = e;
      }
      expect(error.message)
        .to.equal('The "publicKeyBase58" property is required.');
    });
  });

  describe('fromEdKeyPair', () => {
    it('should convert both public and private key', async () => {
      const edKeyPair = await Ed25519VerificationKey2018.from({
        controller: 'did:example:123',
        /* eslint-disable-next-line max-len */
        privateKeyBase58: '4F71TAGqQYe7KE9p4HUzoVV9arQwKP4gPtvi89EPNGuwA1qLE4RRxitA2rEcdEszERj3pN1DWKARBZQ2BACLbW1V',
        publicKeyBase58: 'HLi1h9SzENZyEv7ifPNtu8xyJNzCFFeaC6X9rsZKFgv3'
      });

      const xKeyPair = X25519KeyAgreementKey2019
        .fromEdKeyPair({keyPair: edKeyPair});

      expect(xKeyPair.type).to.equal('X25519KeyAgreementKey2019');
      expect(xKeyPair.controller).to.equal('did:example:123');
      expect(xKeyPair.publicKeyBase58).to
        .equal('9K6xjwBdjKC4W3r41ZP5WUxp8XXm8gT9GvR1G5Eocs1Z');
      expect(xKeyPair.privateKeyBase58).to
        .equal('H9ruaVs9LnRUwxNMLTjDkEbWW1P3bcBuiu7GxoBbEpdV');
    });
  });

  describe('deriveSecret', () => {
    it('should produce a secret from a remote key', async () => {
      const localKey = await X25519KeyAgreementKey2019.from({
        privateKeyBase58: 'B1tfmsThxDBrFx7VdtimC26s1WW1aFySxdR16n5SfDJa',
        publicKeyBase58: 'FWzRdFAfTJGsdPWFvD1oXy469wAsGptMiFpdecxgcek6'
      });

      const remoteKey = await X25519KeyAgreementKey2019.from({
        publicKeyBase58: '73e843su1epHouuHyDzjy2YXZfZrNiXLrr1hjpJkBeUG'
      });

      const secret = localKey.deriveSecret({publicKey: remoteKey});
      const secretString = encode(secret);

      expect(secretString).to
        .equal('3orgcVQPH25E7ybPDz7eEnawCFTtjuYEu3nXQNPbQ1Sv');
    });
  });

  describe('fingerprint', () => {
    it('should round trip convert to and from public key', async () => {
      const key = await X25519KeyAgreementKey2019.generate();
      const fingerprint = key.fingerprint();
      const newKey = X25519KeyAgreementKey2019.fromFingerprint({fingerprint});

      expect(key.publicKeyBase58).to.equal(newKey.publicKeyBase58);
    });

    it('should verify via verifyFingerprint()', async () => {
      const key = await X25519KeyAgreementKey2019.generate();
      const fingerprint = key.fingerprint();

      const result = key.verifyFingerprint({fingerprint});
      expect(result.valid).to.be.true;
      expect(result.error).to.not.exist;
    });
  });
});
