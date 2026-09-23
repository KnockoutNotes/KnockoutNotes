/**
 * KnockoutNotes Analytics Service
 * Connects to Cloudflare's Web Analytics GraphQL API to aggregate visitor metrics
 * without tracking individual users, storing IPs, or running invasive surveillance scripts.
 *
 * Two independent Cloudflare datasets are used:
 *
 * 1. Zone-level HTTP analytics (`httpRequests1dGroups`) — pageviews/requests/bytes
 *    time series. Requires:
 *      - env.CLOUDFLARE_API_TOKEN (Read Analytics permission)
 *      - env.CLOUDFLARE_ZONE_ID (Zone ID for the knockoutnotes domain)
 *
 * 2. Account-level Web Analytics / RUM breakdown (`rumPageloadEventsAdaptiveGroups`)
 *    — top pages, top countries, devices, browsers, operating systems, and
 *    referrers. This is real visitor data captured by the Cloudflare beacon
 *    script (see cf-beacon.js / analytics-config.js) and requires, in addition
 *    to CLOUDFLARE_API_TOKEN (with Account Analytics Read permission):
 *      - env.CLOUDFLARE_ACCOUNT_ID (Cloudflare account ID)
 *      - env.CF_BEACON_TOKEN (the Web Analytics site tag, same token embedded
 *        client-side by cf-beacon.js — used here as the `siteTag` filter)
 *
 * The RUM breakdown query's dimension names are based on Cloudflare's
 * documented GraphQL Analytics API schema and have not been exercised against
 * a live account from this environment. Verify field names still match
 * Cloudflare's current schema (GraphQL introspection on
 * https://api.cloudflare.com/client/v4/graphql) once real credentials are in
 * place, before relying on the breakdown numbers.
 *
 * If credentials for a dataset are not provisioned, or the query fails, that
 * dataset's section of the response reports itself as disconnected with zero
 * mocked or fabricated numbers — never silently substituted or guessed data.
 */

async function queryCloudflareGraphQL(token, query, variables) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudflare GraphQL HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  if (data.errors && data.errors.length > 0) {
    throw new Error(data.errors[0]?.message || 'GraphQL query error');
  }

  return data.data;
}

function dateRangeFor(period) {
  const now = new Date();
  const since = new Date();

  if (period === 'today' || period === '24h') {
    since.setHours(now.getHours() - 24);
  } else if (period === '30d') {
    since.setDate(now.getDate() - 30);
  } else if (period === '90d') {
    since.setDate(now.getDate() - 90);
  } else {
    since.setDate(now.getDate() - 7);
  }

  return { since, now };
}

/**
 * Zone-level pageview/request time series (existing dataset, unchanged behaviour).
 */
async function fetchZoneTimeseries(token, zoneId, since, until) {
  const query = `
    query GetZoneAnalytics($zoneTag: string!, $since: string!, $until: string!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 100
            filter: { date_geq: $since, date_leq: $until }
          ) {
            dimensions { date }
            sum { pageViews requests bytes }
            uniq { uniques }
          }
        }
      }
    }
  `;

  const data = await queryCloudflareGraphQL(token, query, {
    zoneTag: zoneId,
    since: since.toISOString().split('T')[0],
    until: until.toISOString().split('T')[0]
  });

  const groups = data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
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

    return { date: g.dimensions?.date, pageViews: pv, requests: reqs, uniqueVisitors: unq };
  });

  return {
    timeseries,
    summary: { pageViews: totalPageviews, uniqueVisitors: totalUniques, requests: totalRequests, bytes: totalBytes }
  };
}

/**
 * Account-level RUM breakdown: top pages, countries, devices, browsers, OS, referrers.
 */
async function fetchRumBreakdown(token, accountId, siteTag, since, until) {
  const query = `
    query GetRumBreakdown($accountTag: string!, $siteTag: string!, $since: string!, $until: string!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          topPaths: rumPageloadEventsAdaptiveGroups(
            limit: 15
            filter: { siteTag: $siteTag, datetime_geq: $since, datetime_leq: $until }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { requestPath }
          }
          topCountries: rumPageloadEventsAdaptiveGroups(
            limit: 15
            filter: { siteTag: $siteTag, datetime_geq: $since, datetime_leq: $until }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { countryName }
          }
          devices: rumPageloadEventsAdaptiveGroups(
            limit: 10
            filter: { siteTag: $siteTag, datetime_geq: $since, datetime_leq: $until }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { deviceType }
          }
          browsers: rumPageloadEventsAdaptiveGroups(
            limit: 10
            filter: { siteTag: $siteTag, datetime_geq: $since, datetime_leq: $until }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { userAgentBrowser }
          }
          operatingSystems: rumPageloadEventsAdaptiveGroups(
            limit: 10
            filter: { siteTag: $siteTag, datetime_geq: $since, datetime_leq: $until }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { userAgentOS }
          }
          referrers: rumPageloadEventsAdaptiveGroups(
            limit: 15
            filter: { siteTag: $siteTag, datetime_geq: $since, datetime_leq: $until }
            orderBy: [count_DESC]
          ) {
            count
            dimensions { refererHost }
          }
        }
      }
    }
  `;

  const data = await queryCloudflareGraphQL(token, query, {
    accountTag: accountId,
    siteTag,
    since: since.toISOString(),
    until: until.toISOString()
  });

  const account = data?.viewer?.accounts?.[0] || {};
  const toRows = (groups, dimKey, fallbackLabel) =>
    (groups || [])
      .map(g => ({ name: g.dimensions?.[dimKey] || fallbackLabel, count: g.count || 0 }))
      .filter(r => r.count > 0);

  return {
    topPaths: toRows(account.topPaths, 'requestPath', '(unknown path)'),
    topCountries: toRows(account.topCountries, 'countryName', 'Unknown'),
    devices: toRows(account.devices, 'deviceType', 'Unknown'),
    browsers: toRows(account.browsers, 'userAgentBrowser', 'Unknown'),
    operatingSystems: toRows(account.operatingSystems, 'userAgentOS', 'Unknown'),
    referrers: toRows(account.referrers, 'refererHost', 'Direct / None')
  };
}

export async function getWebAnalytics(env, options = {}) {
  const period = options.period || '7d';
  const token = env.CLOUDFLARE_API_TOKEN;
  const zoneId = env.CLOUDFLARE_ZONE_ID;
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const siteTag = env.CF_BEACON_TOKEN;

  const emptyBreakdown = { topPaths: [], topCountries: [], devices: [], browsers: [], operatingSystems: [], referrers: [] };

  if (!token || !zoneId) {
    return {
      connected: false,
      reason: 'CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID secret not configured in Worker.',
      period,
      summary: { pageViews: 0, uniqueVisitors: 0, requests: 0, bytes: 0 },
      timeseries: [],
      rumConnected: false,
      rumReason: 'Zone analytics not connected, so RUM breakdown was not attempted.',
      ...emptyBreakdown
    };
  }

  const { since, now } = dateRangeFor(period);

  let zoneResult;
  try {
    zoneResult = await fetchZoneTimeseries(token, zoneId, since, now);
  } catch (err) {
    return {
      connected: false,
      error: err.message || 'Network error fetching zone analytics',
      period,
      summary: { pageViews: 0, uniqueVisitors: 0, requests: 0, bytes: 0 },
      timeseries: [],
      rumConnected: false,
      rumReason: 'Zone analytics query failed, so RUM breakdown was not attempted.',
      ...emptyBreakdown
    };
  }

  const result = {
    connected: true,
    period,
    since: since.toISOString(),
    until: now.toISOString(),
    summary: zoneResult.summary,
    timeseries: zoneResult.timeseries,
    rumConnected: false,
    rumReason: '',
    ...emptyBreakdown
  };

  if (!accountId || !siteTag) {
    result.rumReason = 'CLOUDFLARE_ACCOUNT_ID or CF_BEACON_TOKEN not configured — top pages, countries, devices, browsers, OS and referrer breakdowns require Cloudflare Web Analytics (RUM) to be enabled for this site.';
    return result;
  }

  try {
    const breakdown = await fetchRumBreakdown(token, accountId, siteTag, since, now);
    Object.assign(result, breakdown);
    result.rumConnected = true;
  } catch (err) {
    result.rumReason = `RUM breakdown query failed: ${err.message || 'unknown error'}`;
  }

  return result;
}
