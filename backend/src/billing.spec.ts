import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { ConflictException } from '@nestjs/common';
import { BillingService } from './billing';

describe('BillingService', () => {
  it('calculates tax and total with cent rounding', async () => {
    let saved: any;
    const db = {
      patient: { findUnique: async () => ({ id: 'patient-id' }) },
      bill: { create: async ({ data }: any) => { saved = data; return data; } },
    };
    await new BillingService(db as any).create({ patientId: 'patient-id', description: 'Consultation', amount: 101.23, tax: 7.25 });
    assert.equal(saved.amount, '101.23');
    assert.equal(saved.tax, '7.34');
    assert.equal(saved.totalAmount, '108.57');
  });

  it('does not modify a paid bill', async () => {
    const db = { bill: { findUnique: async () => ({ id: 'bill-id', amount: 10, tax: 0, paymentStatus: 'Paid', patient: {}, payments: [] }) } };
    await assert.rejects(() => new BillingService(db as any).update('bill-id', { description: 'Changed' }), ConflictException);
  });

  it('rejects a bill whose patient does not exist', async () => {
    const db = { patient: { findUnique: async () => null } };
    await assert.rejects(() => new BillingService(db as any).create({ patientId: 'missing', description: 'Consultation', amount: 10, tax: 0 }), /Patient not found/);
  });
});
