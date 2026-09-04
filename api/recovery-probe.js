const TARGET_URL = 'https://votofortearapongas-security-preview-3l0fa1ydj.vercel.app/';

function readSetCookies(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  const raw = headers.get('set-cookie');
  return raw ? [raw] : [];
}

function storeCookies(jar, headers) {
  for (const rawCookie of readSetCookies(headers)) {
    const firstPart = String(rawCookie).split(';', 1)[0];
    const separator = firstPart.indexOf('=');
    if (separator <= 0) continue;
    const name = firstPart.slice(0, separator).trim();
    const value = firstPart.slice(separator + 1).trim();
    if (name && value) jar.set(name, value);
  }
}

function cookieHeader(jar) {
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join('; ');
}

function safeLocation(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.searchParams.has('_vercel_share')) parsed.searchParams.set('_vercel_share', '[redacted]');
    if (parsed.searchParams.has('share')) parsed.searchParams.set('share', '[redacted]');
    return parsed.toString();
  } catch (_) {
    return value;
  }
}

function readAuthCallback(status, contentType, body) {
  if (status !== 401 || !String(contentType || '').includes('application/json')) return null;
  try {
    const payload = JSON.parse(body);
    return payload?.protection?.vercel_auth_callback
      ? String(payload.protection.vercel_auth_callback)
      : null;
  } catch (_) {
    return null;
  }
}

module.exports = async function recoveryProbe(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  const shareToken = request.query && request.query.share ? String(request.query.share) : '';
  if (!shareToken) return response.status(400).json({ ok: false, reason: 'missing_share_token' });

  const jar = new Map();
  const steps = [];
  let currentUrl = `${TARGET_URL}?_vercel_share=${encodeURIComponent(shareToken)}`;
  let finalResponse = null;
  let finalBody = '';

  try {
    for (let index = 0; index < 10; index += 1) {
      const upstream = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
          cookie: cookieHeader(jar),
          'user-agent': 'Mozilla/5.0 (compatible; VotoForteRecovery/1.0)'
        }
      });

      storeCookies(jar, upstream.headers);
      const body = await upstream.text();
      const contentType = upstream.headers.get('content-type');
      const location = upstream.headers.get('location');
      const authCallback = readAuthCallback(upstream.status, contentType, body);

      steps.push({
        index: index + 1,
        status: upstream.status,
        url: safeLocation(currentUrl),
        location: safeLocation(location),
        authCallback: safeLocation(authCallback),
        contentType,
        bodyLength: body.length,
        cookieNames: Array.from(jar.keys())
      });

      if (authCallback) {
        currentUrl = new URL(authCallback, currentUrl).toString();
        continue;
      }
      if (upstream.status >= 300 && upstream.status < 400 && location) {
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      finalResponse = upstream;
      finalBody = body;
      break;
    }

    if (!finalResponse) {
      return response.status(508).json({ ok: false, reason: 'redirect_limit_reached', cookieNames: Array.from(jar.keys()), steps });
    }

    const isHtml = /<!doctype html|<html/i.test(finalBody);
    const rawRequested = request.query && String(request.query.raw || '') === '1';

    if (rawRequested && finalResponse.ok && isHtml) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('X-Recovered-Deployment', 'dpl_CkEV93Gj394WmR3EYm55YcBm3gW7');
      return response.status(200).send(finalBody);
    }

    return response.status(200).json({
      ok: finalResponse.ok && isHtml,
      finalStatus: finalResponse.status,
      finalUrl: safeLocation(currentUrl),
      contentType: finalResponse.headers.get('content-type'),
      contentLength: finalBody.length,
      isHtml,
      title: finalBody.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null,
      cookieNames: Array.from(jar.keys()),
      steps,
      sample: finalBody.slice(0, 220)
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      reason: 'share_flow_failed',
      message: error instanceof Error ? error.message : String(error),
      cookieNames: Array.from(jar.keys()),
      steps
    });
  }
};
