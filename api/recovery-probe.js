const TARGET_URL = 'https://votofortearapongas-security-preview-3l0fa1ydj.vercel.app/';

module.exports = async function recoveryProbe(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');

  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (!oidcToken) {
    return response.status(500).json({
      ok: false,
      reason: 'missing_vercel_oidc_token'
    });
  }

  try {
    const upstream = await fetch(TARGET_URL, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'x-vercel-trusted-oidc-idp-token': oidcToken,
        'user-agent': 'voto-forte-recovery-probe/1.0'
      }
    });

    const body = await upstream.text();
    const title = body.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null;

    console.log(JSON.stringify({
      event: 'recovery_probe',
      status: upstream.status,
      contentType: upstream.headers.get('content-type'),
      length: body.length,
      location: upstream.headers.get('location')
    }));

    return response.status(200).json({
      ok: upstream.ok,
      hasOidcToken: true,
      upstreamStatus: upstream.status,
      contentType: upstream.headers.get('content-type'),
      contentLength: body.length,
      title,
      isHtml: /<!doctype html|<html/i.test(body),
      redirectedTo: upstream.headers.get('location'),
      sample: body.slice(0, 160)
    });
  } catch (error) {
    console.error('recovery_probe_failed', error);
    return response.status(500).json({
      ok: false,
      reason: 'upstream_fetch_failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
