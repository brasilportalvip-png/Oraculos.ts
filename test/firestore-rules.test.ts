import { readFileSync } from 'node:fs';

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-oraculos',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: readFileSync(
        'firestore.rules',
        'utf8',
      ),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(
    async (context) => {
      const db = context.firestore();

      await setDoc(
        doc(db, 'users/alice'),
        {
          id: 'alice',
          name: 'Alice',
          email:
            'alice@example.test',
          role: 'user',
          status: 'active',
          minuteBalance: 30,
          balance: 30,
          isAdmin: false,
        },
      );

      await setDoc(
        doc(db, 'users/bob'),
        {
          id: 'bob',
          name: 'Bob',
          email:
            'bob@example.test',
          role: 'user',
          status: 'active',
          minuteBalance: 20,
          balance: 20,
          isAdmin: false,
        },
      );
    },
  );
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore.rules', () => {
  it(
    'permite ao usuário ler o próprio perfil',
    async () => {
      const alice =
        testEnv
          .authenticatedContext(
            'alice',
          )
          .firestore();

      await assertSucceeds(
        getDoc(
          doc(
            alice,
            'users/alice',
          ),
        ),
      );
    },
  );

  it(
    'nega leitura do perfil de outro usuário',
    async () => {
      const alice =
        testEnv
          .authenticatedContext(
            'alice',
          )
          .firestore();

      await assertFails(
        getDoc(
          doc(
            alice,
            'users/bob',
          ),
        ),
      );
    },
  );

  it(
    'permite atualização segura do próprio nome',
    async () => {
      const alice =
        testEnv
          .authenticatedContext(
            'alice',
          )
          .firestore();

      await assertSucceeds(
        updateDoc(
          doc(
            alice,
            'users/alice',
          ),
          {
            name:
              'Alice Atualizada',
          },
        ),
      );
    },
  );

  it(
    'nega alteração do próprio saldo',
    async () => {
      const alice =
        testEnv
          .authenticatedContext(
            'alice',
          )
          .firestore();

      await assertFails(
        updateDoc(
          doc(
            alice,
            'users/alice',
          ),
          {
            balance: 9999,
            minuteBalance: 9999,
          },
        ),
      );
    },
  );

  it(
    'nega promoção do próprio papel para superadmin',
    async () => {
      const alice =
        testEnv
          .authenticatedContext(
            'alice',
          )
          .firestore();

      await assertFails(
        updateDoc(
          doc(
            alice,
            'users/alice',
          ),
          {
            role: 'superadmin',
          },
        ),
      );
    },
  );

  it(
    'nega criação de transação financeira pelo cliente',
    async () => {
      const alice =
        testEnv
          .authenticatedContext(
            'alice',
          )
          .firestore();

      await assertFails(
        setDoc(
          doc(
            alice,
            'transactions/injected',
          ),
          {
            userId: 'alice',
            amount: 9999,
          },
        ),
      );
    },
  );
});