/**
 * Sends security events to Charis OS (Control Centre → Monitoring), where rules turn them into
 * alerts: failed logins, rate limits, attempts to use another business's records, token reuse,
 * plan limits reached and plan checks that failed. Batched in the background; never slows or
 * fails a request. Without an OS connection nothing is sent.
 */
const queue = [];
let timer = null;
const MAX_QUEUE = 1000;
const FLUSH_MS = 10000;

function connection() {
  try { return require('./charisOsService').osConnection(); } catch { return null; }
}

async function flush() {
  timer = null;
  const config = connection();
  if (!config) { queue.length = 0; return; }
  while (queue.length) {
    const events = queue.splice(0, 100);
    try {
      const response = await fetch(`${config.origin}/api/v1/integrations/apps/${config.appId}/security-events`, {
        method: 'POST',
        headers: { 'X-Charis-App-Key': config.key, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ contract_version: 1, events }),
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn(`[CharisOS] Security events not delivered (${events.length}): ${error.message}`);
      return; // dropped: monitoring must never pile up memory or retry forever
    }
  }
}

const text = (value, max) => (value === undefined || value === null ? undefined : String(value).slice(0, max));

/** type: one of OS's event types (login_failed, rate_limited, tenant_access_denied, ...). */
function reportSecurityEvent(type, { severity = 'low', tenantId, actorRef, ip, path, detail } = {}) {
  if (!connection() || queue.length >= MAX_QUEUE) return;
  queue.push({
    type,
    severity,
    occurred_at: new Date().toISOString(),
    tenant_id: text(tenantId, 255),
    actor_ref: text(actorRef, 255),
    ip: text(ip, 64),
    path: text(path, 255),
    detail: detail || {},
  });
  if (!timer) { timer = setTimeout(() => { flush().catch(() => {}); }, FLUSH_MS); timer.unref?.(); }
}

module.exports = { reportSecurityEvent, flushSecurityEvents: flush };
