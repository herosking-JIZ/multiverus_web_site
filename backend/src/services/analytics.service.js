const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');

/**
 * Détecte le type d'appareil à partir du User-Agent.
 */
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  if (/tablet|ipad/i.test(userAgent)) return 'tablette';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

/**
 * Extrait le domaine source depuis un referrer.
 */
const getSource = (referrer) => {
  if (!referrer) return 'Direct';
  try {
    return new URL(referrer).hostname || 'Direct';
  } catch {
    return 'Autre';
  }
};

class AnalyticsService {
  async recordEvent(data, userAgent) {
    return prisma.evenementAnalytics.create({
      data: {
        sessionId: data.sessionId,
        pagePath: data.pagePath,
        evenement: data.evenement,
        userAgent: userAgent || null,
        dureeSecondes: data.dureeSecondes || null,
        referrer: data.referrer || null,
      },
    });
  }

  async getDashboard(from, to) {
    // ---------------------------------------------------------------
    // 1. Visiteurs uniques (sessions distinctes)
    // ---------------------------------------------------------------
    const [uniqueVisitorsResult] = await prisma.$queryRaw(Prisma.sql`
      SELECT COUNT(DISTINCT session_id) :: int AS count
      FROM evenements_analytics
      WHERE timestamp BETWEEN ${from} AND ${to}
    `);
    const uniqueVisitors = uniqueVisitorsResult.count;

    // ---------------------------------------------------------------
    // 2. Pages vues totales
    // ---------------------------------------------------------------
    const totalPageviews = await prisma.evenementAnalytics.count({
      where: {
        evenement: 'PAGEVIEW',
        timestamp: { gte: from, lte: to },
      },
    });

    // ---------------------------------------------------------------
    // 3. Durée moyenne de visite (en secondes)
    // ---------------------------------------------------------------
    const [durationResult] = await prisma.$queryRaw(Prisma.sql`
      SELECT COALESCE(AVG(duree_secondes) :: int, 0) AS avg_duration
      FROM evenements_analytics
      WHERE timestamp BETWEEN ${from} AND ${to}
        AND duree_secondes IS NOT NULL
    `);
    const avgDuration = durationResult.avg_duration;

    // ---------------------------------------------------------------
    // 4. Taux de rebond (% sessions avec exactement 1 pageview)
    // ---------------------------------------------------------------
    const [bounceResult] = await prisma.$queryRaw(Prisma.sql`
      SELECT
        COUNT(*) FILTER (WHERE pv_count = 1) :: int AS bounced,
        COUNT(*) :: int AS total
      FROM (
        SELECT session_id, COUNT(*) FILTER (WHERE evenement = 'PAGEVIEW') AS pv_count
        FROM evenements_analytics
        WHERE timestamp BETWEEN ${from} AND ${to}
        GROUP BY session_id
      ) sessions
    `);
    const bounceRate =
      bounceResult.total > 0
        ? Math.round((bounceResult.bounced / bounceResult.total) * 100)
        : 0;

    // ---------------------------------------------------------------
    // 5. Top 10 pages
    // ---------------------------------------------------------------
    const topPages = await prisma.$queryRaw(Prisma.sql`
      SELECT page_path AS path, COUNT(*) :: int AS views
      FROM evenements_analytics
      WHERE evenement = 'PAGEVIEW'
        AND timestamp BETWEEN ${from} AND ${to}
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `);

    // ---------------------------------------------------------------
    // 6. Nouveaux leads sur la période
    // ---------------------------------------------------------------
    const newLeads = await prisma.lead.count({
      where: { createdAt: { gte: from, lte: to } },
    });

    // ---------------------------------------------------------------
    // 7. Répartition desktop / mobile / tablette
    // ---------------------------------------------------------------
    const sessionsWithUA = await prisma.$queryRaw(Prisma.sql`
      SELECT DISTINCT ON (session_id) session_id, user_agent
      FROM evenements_analytics
      WHERE timestamp BETWEEN ${from} AND ${to}
    `);

    const devices = { desktop: 0, mobile: 0, tablette: 0, unknown: 0 };
    for (const { user_agent } of sessionsWithUA) {
      devices[getDeviceType(user_agent)]++;
    }

    // ---------------------------------------------------------------
    // 8. Évolution du trafic jour par jour
    // ---------------------------------------------------------------
    const dailyTraffic = await prisma.$queryRaw(Prisma.sql`
      SELECT
        DATE_TRUNC('day', timestamp) :: date AS day,
        COUNT(*) :: int AS pageviews,
        COUNT(DISTINCT session_id) :: int AS sessions
      FROM evenements_analytics
      WHERE evenement = 'PAGEVIEW'
        AND timestamp BETWEEN ${from} AND ${to}
      GROUP BY day
      ORDER BY day ASC
    `);

    // ---------------------------------------------------------------
    // 9. Sources de trafic (depuis referrer)
    // ---------------------------------------------------------------
    const referrers = await prisma.$queryRaw(Prisma.sql`
      SELECT referrer, COUNT(*) :: int AS visits
      FROM evenements_analytics
      WHERE evenement = 'PAGEVIEW'
        AND timestamp BETWEEN ${from} AND ${to}
      GROUP BY referrer
      ORDER BY visits DESC
      LIMIT 20
    `);

    const sources = referrers.reduce((acc, row) => {
      const source = getSource(row.referrer);
      acc[source] = (acc[source] || 0) + row.visits;
      return acc;
    }, {});

    const topSources = Object.entries(sources)
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // ---------------------------------------------------------------
    // 10. Nombre de téléchargements
    // ---------------------------------------------------------------
    const downloads = await prisma.evenementAnalytics.count({
      where: {
        evenement: 'DOWNLOAD',
        timestamp: { gte: from, lte: to },
      },
    });

    return {
      periode: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      visiteurs_uniques: uniqueVisitors,
      pages_vues: totalPageviews,
      duree_moyenne_secondes: avgDuration,
      taux_rebond_pct: bounceRate,
      top_pages: topPages,
      nouveaux_leads: newLeads,
      appareils: devices,
      trafic_journalier: dailyTraffic,
      sources_trafic: topSources,
      telechargements: downloads,
    };
  }
}

module.exports = new AnalyticsService();
