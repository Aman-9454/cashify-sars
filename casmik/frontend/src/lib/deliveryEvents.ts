// Global subscriber map: deliveryAgentId -> Set of controller callbacks across serverless lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __deliveryEventSubscribers: Map<string, Set<(data: string) => void>> | undefined;
}

if (!globalThis.__deliveryEventSubscribers) {
  globalThis.__deliveryEventSubscribers = new Map();
}

export const deliverySubscribers = globalThis.__deliveryEventSubscribers;

export function notifyDeliveryOrder(deliveryAgentId: string, order: any) {
  if (!deliveryAgentId) return;
  const cbs = deliverySubscribers.get(deliveryAgentId);
  if (cbs && cbs.size > 0) {
    const payload = JSON.stringify({ type: 'new_pickup_assigned', order });
    cbs.forEach((cb) => {
      try {
        cb(payload);
      } catch {
        // ignore dead subscriber
      }
    });
  }
}
