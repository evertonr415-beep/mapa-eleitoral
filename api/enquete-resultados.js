const SOURCE_URL = 'https://www.sistemavotoforte.com.br/api/enquete/arapongas-fotos-preview';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const upstream = await fetch(SOURCE_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!upstream.ok) throw new Error(`Fonte respondeu ${upstream.status}`);

    const data = await upstream.json();
    if (!data || data.success !== true) throw new Error('Resposta inválida da fonte');

    const safeRanking = (value) => Array.isArray(value)
      ? value.map((item) => ({
          candidate: String(item?.candidate || ''),
          votes: Number(item?.votes || 0),
          percentage: Number(item?.percentage || 0),
        }))
      : [];

    return res.status(200).json({
      success: true,
      source: 'sistemavotoforte.com.br',
      totalResponses: Number(data.totalResponses || 0),
      managementRanking: safeRanking(data.managementRanking),
      presidentRanking: safeRanking(data.presidentRanking),
      governorRanking: safeRanking(data.governorRanking),
      senatorRanking: safeRanking(data.senatorRanking),
      federalRanking: safeRanking(data.federalRanking),
      stateRanking: safeRanking(data.stateRanking),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[enquete-resultados] falha ao consultar fonte', error);
    return res.status(502).json({ success: false, error: 'Não foi possível carregar os resultados agora.' });
  }
};
