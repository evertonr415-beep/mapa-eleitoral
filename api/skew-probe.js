const crypto = require('node:crypto');

const PRODUCTION_URL = 'https://votofortearapongas-security-preview.vercel.app/';
const REQUESTED_DEPLOYMENT_ID = 'dpl_CkEV93Gj394WmR3EYm55YcBm3gW7';

function summarize(label, response, body) {
  return {
    label,
    status: response.status,
    contentType: response.headers.get('content-type'),
    contentLength: body.length,
    sha256: crypto.createHash('sha256').update(body).digest('hex'),
    title: body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null,
    isHtml: /<!doctype html|<html/i.test(body),
    sample: body.slice(0, 180)
  };
}

async function requestVariant(label, url, headers = {}) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
      'user-agent': 'VotoForteSkewProbe/1.0',
      ...headers
    }
  });
  const body = await response.text();
  return summarize(label, response, body);
}

module.exports = async function skewProbe(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const baseline = await requestVariant('baseline', `${PRODUCTION_URL}?probe=baseline`);
    const cookie = await requestVariant('cookie', `${PRODUCTION_URL}?probe=cookie`, {
      cookie: `__vdpl=${REQUESTED_DEPLOYMENT_ID}`,
      'sec-fetch-dest': 'document'
    });
    const header = await requestVariant('header', `${PRODUCTION_URL}?probe=header`, {
      'x-deployment-id': REQUESTED_DEPLOYMENT_ID
    });
    const query = await requestVariant('query', `${PRODUCTION_URL}?probe=query&dpl=${encodeURIComponent(REQUESTED_DEPLOYMENT_ID)}`);

    return response.status(200).json({
      requestedDeploymentId: REQUESTED_DEPLOYMENT_ID,
      skewProtectionEnabled: process.env.VERCEL_SKEW_PROTECTION_ENABLED || null,
      currentDeploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
      variants: [baseline, cookie, header, query],
      differsFromBaseline: {
        cookie: cookie.sha256 !== baseline.sha256,
        header: header.sha256 !== baseline.sha256,
        query: query.sha256 !== baseline.sha256
      }
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
