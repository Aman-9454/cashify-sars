// Global subscriber map: partnerId -> Set of controller callbacks across serverless lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __partnerEventSubscribers: Map<string, Set<(data: string) => void>> | undefined;
}

if (!globalThis.__partnerEventSubscribers) {
  globalThis.__partnerEventSubscribers = new Map();
}

export const partnerSubscribers = globalThis.__partnerEventSubscribers;

export function notifyPartnerOrder(partnerId: string, order: any) {
  const cbs = partnerSubscribers.get(partnerId);
  if (cbs && cbs.size > 0) {
    const payload = JSON.stringify({ type: 'new_order_assigned', order });
    cbs.forEach((cb) => {
      try {
        cb(payload);
      } catch {
        // ignore dead subscriber
      }
    });
  }
}
