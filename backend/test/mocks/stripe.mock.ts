import { jest } from '@jest/globals';

export const createStripeMock = () => {
  return {
    checkout: {
      sessions: {
        create: jest.fn<() => Promise<{ id: string; url: string; payment_intent: string }>>().mockResolvedValue({
          id: 'cs_test_mockSessionId',
          url: 'https://checkout.stripe.com/pay/cs_test_mockSessionId',
          payment_intent: 'pi_test_mockPaymentIntent'
        }),
        retrieve: jest.fn<() => Promise<{ id: string; payment_intent: string }>>().mockResolvedValue({
          id: 'cs_test_mockSessionId',
          payment_intent: 'pi_test_mockPaymentIntent'
        })
      }
    },
    accounts: {
      create: jest.fn<() => Promise<{ id: string; charges_enabled: boolean; payouts_enabled: boolean }>>().mockResolvedValue({
        id: 'acct_mock123',
        charges_enabled: true,
        payouts_enabled: true
      }),
      retrieve: jest.fn<() => Promise<{ id: string; charges_enabled: boolean; payouts_enabled: boolean }>>().mockResolvedValue({
        id: 'acct_mock123',
        charges_enabled: true,
        payouts_enabled: true
      }),
      del: jest.fn<() => Promise<{ id: string; deleted: boolean }>>().mockResolvedValue({
        id: 'acct_mock123',
        deleted: true
      })
    },
    accountLinks: {
      create: jest.fn<() => Promise<{ url: string; created: number; expires_at: number }>>().mockResolvedValue({
        url: 'https://connect.stripe.com/setup/mock',
        created: Date.now(),
        expires_at: Date.now() + 3600000
      })
    },
    payouts: {
      create: jest.fn<() => Promise<{ id: string; amount: number; status: string }>>().mockResolvedValue({
        id: 'po_mock123',
        amount: 1000,
        status: 'pending'
      }),
      retrieve: jest.fn<() => Promise<{ id: string; status: string; metadata: { userId: string } }>>().mockResolvedValue({
        id: 'po_mock123',
        status: 'pending',
        metadata: { userId: 'test-user-id' }
      }),
      cancel: jest.fn<() => Promise<{ id: string; status: string }>>().mockResolvedValue({
        id: 'po_mock123',
        status: 'canceled'
      })
    },
    balance: {
      retrieve: jest.fn<() => Promise<{ available: { amount: number; currency: string }[]; pending: { amount: number; currency: string }[] }>>().mockResolvedValue({
        available: [{ amount: 5000, currency: 'pln' }],
        pending: [{ amount: 0, currency: 'pln' }]
      })
    },
    refunds: {
      create: jest.fn<() => Promise<{ id: string; amount: number; status: string; metadata: { orderId: string } }>>().mockResolvedValue({
        id: 're_mock123',
        amount: 1499,
        status: 'succeeded',
        metadata: { orderId: 'test-order-id' }
      })
    },
    webhooks: {
      constructEvent: jest.fn<(payload: Buffer | string, signature: string) => any>().mockImplementation((payload) => {
        return JSON.parse(payload.toString());
      })
    },
    paymentIntents: {
      retrieve: jest.fn<() => Promise<{ id: string; amount: number; status: string; metadata: { orderId: string } }>>().mockResolvedValue({
        id: 'pi_test_mockPaymentIntent',
        amount: 1499,
        status: 'succeeded',
        metadata: { orderId: 'test-order-id' }
      })
    }
  };
};
