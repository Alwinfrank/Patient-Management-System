import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { ConflictException } from '@nestjs/common';
import { Gender } from '@prisma/client';
import { PatientsService } from './patients';

describe('PatientsService', () => {
  it('trims the name query and applies the gender filter', async () => {
    let query: any;
    const db = { patient: { findMany: async (args: any) => { query = args; return []; } } };
    await new PatientsService(db as any).list('  sam  ', Gender.Female);
    assert.deepEqual(query.where, { name: { contains: 'sam' }, gender: Gender.Female });
  });

  it('returns a useful conflict when a patient email is already used', async () => {
    const db = { patient: { create: async () => { throw { code: 'P2002' }; } } };
    await assert.rejects(() => new PatientsService(db as any).create({ name: 'Sam Lee', age: 35, gender: Gender.Other, phoneNumber: '1234567890', email: 'SAM@example.com', address: '1 Main Street' }), ConflictException);
  });
});
