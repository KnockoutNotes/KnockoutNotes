/**
 * KnockoutNotes Analytics Service
 * Connects to Cloudflare's Web Analytics GraphQL API to aggregate visitor metrics
 * without tracking individual users, storing IPs, or running invasive surveillance scripts.
 *
 * Requirements for live data:
 * - env.CLOUDFLARE_API_TOKEN (Read Analytics permission)
 * - env.CLOUDFLARE_ZONE_ID (Zone ID for knockoutnotes domain)
 *
 * If either credential is not provisioned, returns honest disconnected status
 * with zero mocked or fabricated numbers.
 */

export async function getWebAnalytics(env, options = {}) {
  const token = env.CLOUDFLARE_API_TOKEN;
  const zoneId = env.CLOUDFLARE_ZONE_ID;

  if (!token || !zoneId) {
    return {
      connected: false,
      reason: 'CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID secret not configured in Worker.',
      period: options.period || '7d',
      summary: {
        pageViews: 0,
        uniqueVisitors: 0,
        requests: 0,
        bytes: 0
      },
      timeseries: [],
      topPaths: [],
      topCountries: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      referrers: []
    };
  }

  // Calculate datetime ranges based on period
  const period = options.period || '7d';
  const now = new Date();
  let since = new Date();

  if (period === 'today' || period === '24h') {
    since.setHours(now.getHours() - 24);
  } else if (period === '30d') {
    since.setDate(now.getDate() - 30);
  } else if (period === '90d') {
    since.setDate(now.getDate() - 90);
  } else {
    // Default 7 days
    since.setDate(now.getDate() - 7);
  }

  const sinceISO = since.toISOString();
  const untilISO = now.toISOString();

  // Cloudflare GraphQL query for HTTP requests and Web Analytics adaptive dataset
  const query = `
    query GetAnalytics($zoneTag: string!, $since: string!, $until: string!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 100
            filter: { date_geq: $since, date_leq: $until }
          ) {
            dimensions {
              date
            }
            sum {
              pageViews
              requests
              bytes
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `;

  try {
    const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: {
          zoneTag: zoneId,
          since: sinceISO.split('T')[0],
          until: untilISO.split('T')[0]
        }
      })
    });

    if (!cfRes.ok) {
      const errText = await cfRes.text();
      return {
        connected: false,
        error: `Cloudflare GraphQL error: ${cfRes.status}`,
        details: errText,
        period,
        summary: { pageViews: 0, uniqueVisitors: 0, requests: 0, bytes: 0 }
      };
    }

    const data = await cfRes.json();
    if (data.errors && data.errors.length > 0) {
      return {
        connected: false,
        error: data.errors[0]?.message || 'GraphQL Query Error',
        period,
        summary: { pageViews: 0, uniqueVisitors: 0, requests: 0, bytes: 0 }
      };
    }

    const groups = data?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
    let totalPageviews = 0;
    let totalUniques = 0;
    let totalRequests = 0;
    let totalBytes = 0;

    const timeseries = groups.map(g => {
      const pv = g.sum?.pageViews || 0;
      const reqs = g.sum?.requests || 0;
      const unq = g.uniq?.uniques || 0;
      const b = g.sum?.bytes || 0;

      totalPageviews += pv;
      totalUniques += unq;
      totalRequests += reqs;
      totalBytes += b;

      return {
        date: g.dimensions?.date,
        pageViews: pv,
        requests: reqs,
        uniqueVisitors: unq
      };
    });

    return {
      connected: true,
      period,
      since: sinceISO,
      until: untilISO,
      summary: {
        pageViews: totalPageviews,
        uniqueVisitors: totalUniques,
        requests: totalRequests,
        bytes: totalBytes
      },
      timeseries,
      topPaths: [],
      topCountries: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      referrers: []
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message || 'Network error fetching analytics',
      period,
      summary: { pageViews: 0, uniqueVisitors: 0, requests: 0, bytes: 0 }
    };
  }
}
