// Backend/routes/ai.js
// PrithviNet AI Features: Report Generator, Copilot, Forecasting

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate'
const OLLAMA_MODEL = 'qwen2.5:1.5b'

async function askOllama(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    })
  })
  const data = await response.json()
  return data.response
}

async function aiRoutes(fastify, options) {

  // ─── FEATURE 1: SUMMARY REPORT GENERATOR ────────────────────────────────────
  fastify.post('/api/ai/report', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { days = 7, locationId, reportType = 'consolidated' } = request.body || {}

      const since = new Date()
      since.setDate(since.getDate() - days)

      const whereClause = {
        timestamp: { gte: since },
        ...(locationId && { locationId })
      }

      // Fetch data from all 3 types
      const [airData, waterData, noiseData, alerts, limits] = await Promise.all([
        fastify.prisma.airData.findMany({
          where: whereClause,
          include: { location: { include: { region: true } } },
          orderBy: { timestamp: 'desc' },
          take: 50
        }),
        fastify.prisma.waterData.findMany({
          where: whereClause,
          include: { location: { include: { region: true } } },
          orderBy: { timestamp: 'desc' },
          take: 50
        }),
        fastify.prisma.noiseData.findMany({
          where: whereClause,
          include: { location: { include: { region: true } } },
          orderBy: { timestamp: 'desc' },
          take: 50
        }),
        fastify.prisma.alert.findMany({
          where: { createdAt: { gte: since } },
          include: { location: true },
          orderBy: { createdAt: 'desc' },
          take: 50
        }),
        fastify.prisma.prescribedLimit.findMany({
          include: { unit: true }
        })
      ])

      // Calculate statistics with region-wise breakdown
      const airStats = airData.length > 0 ? {
        count: airData.length,
        avgAQI: (airData.reduce((s, r) => s + (r.aqi || 0), 0) / airData.length).toFixed(1),
        maxAQI: Math.max(...airData.map(r => r.aqi || 0)).toFixed(1),
        minAQI: Math.min(...airData.map(r => r.aqi || 0)).toFixed(1),
        avgPM25: (airData.reduce((s, r) => s + (r.pm25 || 0), 0) / airData.length).toFixed(1),
        maxPM25: Math.max(...airData.map(r => r.pm25 || 0)).toFixed(1),
        violations: airData.filter(r => (r.aqi || 0) > 100).length,
        violationLocations: [...new Set(airData.filter(r => (r.aqi || 0) > 100).map(r => r.location?.name || 'Unknown'))],
        byRegion: Object.entries(airData.reduce((acc, r) => {
          const region = r.location?.region?.name || 'Unknown'
          if (!acc[region]) acc[region] = { total: 0, sumAqi: 0, violations: 0 }
          acc[region].total++
          acc[region].sumAqi += (r.aqi || 0)
          if ((r.aqi || 0) > 100) acc[region].violations++
          return acc
        }, {})).map(([region, data]) => `${region}: ${data.total} readings, Avg AQI: ${(data.sumAqi / data.total).toFixed(1)}, Violations: ${data.violations}`)
      } : null

      const waterStats = waterData.length > 0 ? {
        count: waterData.length,
        avgPH: (waterData.reduce((s, r) => s + (r.ph || 0), 0) / waterData.length).toFixed(2),
        avgTDS: (waterData.reduce((s, r) => s + (r.tds || 0), 0) / waterData.length).toFixed(1),
        avgTurbidity: (waterData.reduce((s, r) => s + (r.turbidity || 0), 0) / waterData.length).toFixed(2),
        violations: waterData.filter(r => (r.ph || 7) < 6.5 || (r.ph || 7) > 8.5).length,
        violationLocations: [...new Set(waterData.filter(r => (r.ph || 7) < 6.5 || (r.ph || 7) > 8.5).map(r => r.location?.name || 'Unknown'))],
        byRegion: Object.entries(waterData.reduce((acc, r) => {
          const region = r.location?.region?.name || 'Unknown'
          if (!acc[region]) acc[region] = { total: 0, sumPh: 0, violations: 0 }
          acc[region].total++
          acc[region].sumPh += (r.ph || 0)
          if ((r.ph || 7) < 6.5 || (r.ph || 7) > 8.5) acc[region].violations++
          return acc
        }, {})).map(([region, data]) => `${region}: ${data.total} readings, Avg pH: ${(data.sumPh / data.total).toFixed(2)}, Violations: ${data.violations}`)
      } : null

      const noiseStats = noiseData.length > 0 ? {
        count: noiseData.length,
        avgLaeq: (noiseData.reduce((s, r) => s + (r.laeq || 0), 0) / noiseData.length).toFixed(1),
        maxLaeq: Math.max(...noiseData.map(r => r.laeq || 0)).toFixed(1),
        violations: noiseData.filter(r => (r.laeq || 0) > 75).length,
        violationLocations: [...new Set(noiseData.filter(r => (r.laeq || 0) > 75).map(r => r.location?.name || 'Unknown'))],
        byRegion: Object.entries(noiseData.reduce((acc, r) => {
          const region = r.location?.region?.name || 'Unknown'
          if (!acc[region]) acc[region] = { total: 0, sumLaeq: 0, violations: 0 }
          acc[region].total++
          acc[region].sumLaeq += (r.laeq || 0)
          if ((r.laeq || 0) > 75) acc[region].violations++
          return acc
        }, {})).map(([region, data]) => `${region}: ${data.total} readings, Avg Noise: ${(data.sumLaeq / data.total).toFixed(1)} dB(A), Violations: ${data.violations}`)
      } : null

      const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length
      const warningAlerts = alerts.filter(a => a.severity === 'WARNING').length

      // Build common data block used by all report types
      const dataBlock = `
AIR QUALITY DATA (measured in AQI & PM2.5 ug/m3):
${airStats ? `- Total readings: ${airStats.count}
- Average AQI: ${airStats.avgAQI} (prescribed limit: 100)
- Maximum AQI recorded: ${airStats.maxAQI}, Minimum AQI: ${airStats.minAQI}
- Average PM2.5: ${airStats.avgPM25} ug/m3
- Maximum PM2.5: ${airStats.maxPM25} ug/m3
- AQI Violations (above 100): ${airStats.violations}
- Violation locations: ${airStats.violationLocations.join(', ') || 'None'}
- Region-wise breakdown: ${airStats.byRegion.join(' | ')}` : '- No air quality data available'}

WATER QUALITY DATA (measured in pH, TDS mg/L, Turbidity NTU):
${waterStats ? `- Total readings: ${waterStats.count}
- Average pH: ${waterStats.avgPH} (safe range: 6.5 to 8.5)
- Average TDS: ${waterStats.avgTDS} mg/L
- Average Turbidity: ${waterStats.avgTurbidity} NTU
- pH violations (outside 6.5-8.5): ${waterStats.violations}
- Violation locations: ${waterStats.violationLocations.join(', ') || 'None'}
- Region-wise breakdown: ${waterStats.byRegion.join(' | ')}` : '- No water quality data available'}

NOISE POLLUTION DATA (measured in dB(A) - Laeq):
${noiseStats ? `- Total readings: ${noiseStats.count}
- Average noise level: ${noiseStats.avgLaeq} dB(A)
- Maximum noise level: ${noiseStats.maxLaeq} dB(A)
- Violations (above 75 dB): ${noiseStats.violations}
- Violation locations: ${noiseStats.violationLocations.join(', ') || 'None'}
- Region-wise breakdown: ${noiseStats.byRegion.join(' | ')}` : '- No noise data available'}

ALERTS SUMMARY:
- Critical alerts: ${criticalAlerts}
- Warning alerts: ${warningAlerts}
- Total alerts in period: ${alerts.length}
${alerts.length > 0 ? `- Recent alerts:\n${alerts.slice(0, 10).map(a => '  * [' + a.severity + '] ' + a.message + ' at ' + (a.location?.name || 'Unknown') + ' (' + new Date(a.createdAt).toLocaleDateString() + ')').join('\n')}` : ''}`

      // Build prompt based on report type
      let prompt = ''
      const periodLabel = days <= 7 ? 'weekly' : days <= 31 ? 'monthly' : days <= 365 ? 'yearly' : days + '-day'

      if (reportType === 'violations') {
        prompt = `You are an environmental compliance officer for the Chhattisgarh Environment Conservation Board (CECB) in India.
Generate a VIOLATION & ALERT DIGEST report for the last ${days} days (${periodLabel} report).

${dataBlock}

PRESCRIBED LIMITS:
${limits.map(l => '- ' + l.parameter + ': ' + (l.minValue ? 'Min ' + l.minValue : '') + ' ' + (l.maxValue ? 'Max ' + l.maxValue : '') + ' ' + (l.unit?.symbol || '')).join('\n') || '- No limits defined'}

Write a VIOLATION-FOCUSED report with these exact sections:
1. Violations Overview - Total violations count across all 3 pollution types (air, water, noise) with a brief summary
2. Air Quality Violations - Detailed list of AQI violations: which locations exceeded limits, by how much, dates, and regions affected
3. Water Quality Violations - Detailed list of pH/TDS violations: which locations had unsafe water quality, specific readings, and regions affected
4. Noise Pollution Violations - Detailed list of noise violations: which locations exceeded 75 dB limit, peak readings, and regions affected
5. Alerts Triggered - List all critical and warning alerts with their severity, location, and date
6. Region-wise Violation Summary - Break down total violations by region across all pollution types
7. Compliance Recommendations - Specific actions needed for the most violated locations

Focus ONLY on violations, breaches, and alerts. Be very specific with location names, exact readings that violated limits, and dates. This is NOT a general summary - focus exclusively on non-compliance data.`

      } else if (reportType === 'trends') {
        prompt = `You are an environmental data analyst for the Chhattisgarh Environment Conservation Board (CECB) in India.
Generate an AQI & POLLUTION TREND ANALYSIS report for the last ${days} days (${periodLabel} report).

${dataBlock}

Write a TREND-FOCUSED analysis with these exact sections:
1. Trend Overview - Brief summary of overall pollution trends across all 3 types (air, water, noise) over the ${periodLabel} period
2. Air Quality Trends - How AQI (ug/m3) has changed over the period: is it increasing, stable, or decreasing? Identify peak periods and any seasonal patterns. Compare current averages with previous readings.
3. Water Quality Trends - How pH, TDS (mg/L), and Turbidity (NTU) have trended: identify any deterioration or improvement patterns across regions
4. Noise Level Trends - How noise levels (dB) have evolved: identify peak hours/periods, compare industrial vs residential zones
5. Comparative Analysis - Compare trends across all 3 pollution types: are they correlated? Which type is worsening the most?
6. Regional Trends - How different regions compare in terms of pollution trends over time
7. Forecast & Predictions - Based on current trends, predict what the pollution levels might look like in the coming weeks/month. Flag any concerning upward trends.

Focus ONLY on temporal patterns, trends, and data analysis. Use specific numbers, percentages, and time comparisons. This is NOT a general summary - focus exclusively on how pollution data has changed over the ${periodLabel} period.`

      } else {
        // Default: consolidated report
        prompt = `You are an environmental monitoring expert for the Chhattisgarh Environment Conservation Board (CECB) in India.
Generate a CONSOLIDATED ${periodLabel.toUpperCase()} ENVIRONMENTAL REPORT for the last ${days} days.

${dataBlock}

Write a comprehensive consolidated report with these exact sections:
1. Executive Summary - 3-4 sentence overview of the environmental status across all 3 pollution types (air quality, water quality, noise levels)
2. Air Quality Analysis - Detailed analysis of AQI and PM2.5 readings (ug/m3): averages, maximums, region-wise performance, and compliance status against the 100 AQI limit
3. Water Quality Analysis - Detailed analysis of pH, TDS (mg/L), and Turbidity (NTU): averages, compliance with safe pH range (6.5-8.5), region-wise performance
4. Noise Pollution Analysis - Detailed analysis of noise levels in dB(A): averages, peak readings, compliance with the 75 dB limit, region-wise performance
5. Violations & Alerts Summary - Combined violations count and alert summary across all 3 pollution types with affected locations
6. Overall Environmental Health Score - Rate the overall environmental compliance as Good/Moderate/Poor based on the data
7. Recommendations - Specific actionable recommendations for authorities based on the data

Cover ALL three pollution types (air, water, noise) equally and thoroughly. Include specific numbers, locations, and regions. This is a ${periodLabel} summary for decision-makers.`
      }

      const reportText = await askOllama(prompt)

      return reply.send({
        success: true,
        report: reportText,
        stats: { airStats, waterStats, noiseStats },
        alerts: { critical: criticalAlerts, warning: warningAlerts, total: alerts.length },
        generatedAt: new Date().toISOString(),
        periodDays: days,
        reportType
      })

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Failed to generate report', details: error.message })
    }
  })


  // ─── FEATURE 2: COPILOT AI ───────────────────────────────────────────────────
  fastify.post('/api/ai/copilot', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { question } = request.body

      if (!question) {
        return reply.status(400).send({ error: 'Question is required' })
      }

      // Fetch context from DB
      const [recentAir, recentWater, recentNoise, limits, industries, alerts] = await Promise.all([
        fastify.prisma.airData.findMany({
          orderBy: { timestamp: 'desc' },
          take: 10,
          include: { location: true }
        }),
        fastify.prisma.waterData.findMany({
          orderBy: { timestamp: 'desc' },
          take: 10,
          include: { location: true }
        }),
        fastify.prisma.noiseData.findMany({
          orderBy: { timestamp: 'desc' },
          take: 10,
          include: { location: true }
        }),
        fastify.prisma.prescribedLimit.findMany({
          include: { unit: true }
        }),
        fastify.prisma.industry.findMany({
          where: { status: 'ACTIVE' },
          take: 10
        }),
        fastify.prisma.alert.findMany({
          where: { status: 'ACTIVE' },
          take: 10,
          include: { location: true }
        })
      ])

      const contextSummary = `
CURRENT ENVIRONMENTAL DATA (Chhattisgarh, India):

Recent Air Quality Readings:
${recentAir.map(r => `- ${r.location.name}: AQI=${r.aqi || 'N/A'}, PM2.5=${r.pm25 || 'N/A'} ug/m3`).join('\n') || 'No data'}

Recent Water Quality Readings:
${recentWater.map(r => `- ${r.location.name}: pH=${r.ph || 'N/A'}, TDS=${r.tds || 'N/A'} mg/L`).join('\n') || 'No data'}

Recent Noise Levels:
${recentNoise.map(r => `- ${r.location.name}: Laeq=${r.laeq || 'N/A'} dB(A)`).join('\n') || 'No data'}

Prescribed Limits:
${limits.map(l => `- ${l.parameter}: ${l.minValue ? 'Min ' + l.minValue : ''} ${l.maxValue ? 'Max ' + l.maxValue : ''} ${l.unit?.symbol || ''}`).join('\n') || 'No limits defined'}

Active Industries (${industries.length} total):
${industries.map(i => `- ${i.name} (${i.type})`).join('\n') || 'None'}

Active Alerts (${alerts.length}):
${alerts.map(a => `- ${a.severity}: ${a.message} at ${a.location.name}`).join('\n') || 'No active alerts'}
`

      const prompt = `You are PrithviNet Copilot, an AI assistant for the Chhattisgarh Environment Conservation Board (CECB). 
You help environmental regulators make data-driven decisions about pollution management and policy.

Here is the current environmental data from the monitoring system:
${contextSummary}

Regulator's question: ${question}

Provide a helpful, specific, and actionable answer. If the question involves predicting impacts or simulating scenarios, use the available data to make reasonable estimates. Be concise but thorough. Use numbers where possible.`

      const answer = await askOllama(prompt)

      return reply.send({
        success: true,
        question,
        answer,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Copilot failed', details: error.message })
    }
  })


  // ─── FEATURE 3: POLLUTION FORECASTING (pure math, no model needed) ───────────
  fastify.get('/api/ai/forecast/:type/:locationId', async (request, reply) => {
    try {
      const { type, locationId } = request.params
      const days = parseInt(request.query.days) || 14

      const since = new Date()
      since.setDate(since.getDate() - days)

      let readings = []

      if (type === 'air') {
        const data = await fastify.prisma.airData.findMany({
          where: { locationId, timestamp: { gte: since } },
          orderBy: { timestamp: 'asc' }
        })
        readings = data.map(r => ({ timestamp: r.timestamp, value: r.aqi || r.pm25 || 0, pm25: r.pm25, aqi: r.aqi }))
      } else if (type === 'water') {
        const data = await fastify.prisma.waterData.findMany({
          where: { locationId, timestamp: { gte: since } },
          orderBy: { timestamp: 'asc' }
        })
        readings = data.map(r => ({ timestamp: r.timestamp, value: r.ph || 0, ph: r.ph, tds: r.tds }))
      } else if (type === 'noise') {
        const data = await fastify.prisma.noiseData.findMany({
          where: { locationId, timestamp: { gte: since } },
          orderBy: { timestamp: 'asc' }
        })
        readings = data.map(r => ({ timestamp: r.timestamp, value: r.laeq || 0, laeq: r.laeq }))
      }

      // If no real data, generate realistic synthetic data for demo
      if (readings.length < 3) {
        const baseValues = { air: 75, water: 7.2, noise: 65 }
        const base = baseValues[type] || 70
        readings = []
        for (let i = days; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          readings.push({
            timestamp: d,
            value: base + (Math.random() - 0.5) * 20 + Math.sin(i * 0.5) * 5
          })
        }
      }

      const values = readings.map(r => r.value)
      const n = values.length

      // Simple linear regression for trend
      const xMean = (n - 1) / 2
      const yMean = values.reduce((a, b) => a + b, 0) / n
      const slope = values.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0) /
        values.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0)

      // Moving average for smoothing (window of 3)
      const windowSize = Math.min(3, n)
      const lastAvg = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize

      // Standard deviation for uncertainty bands
      const variance = values.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0) / n
      const stdDev = Math.sqrt(variance)

      // Generate 72-hour (3-day) forecast
      const forecast = []
      const lastTimestamp = new Date(readings[readings.length - 1].timestamp)

      for (let h = 1; h <= 72; h++) {
        const forecastTime = new Date(lastTimestamp)
        forecastTime.setHours(forecastTime.getHours() + h)

        // Predict: last moving average + trend * hours + small sine wave for daily pattern
        const dayPattern = Math.sin((h / 24) * 2 * Math.PI) * (stdDev * 0.3)
        const predicted = lastAvg + (slope * h * 0.1) + dayPattern
        const uncertainty = stdDev * (1 + h / 72) * 0.5

        forecast.push({
          timestamp: forecastTime.toISOString(),
          predicted: Math.max(0, parseFloat(predicted.toFixed(2))),
          min: Math.max(0, parseFloat((predicted - uncertainty).toFixed(2))),
          max: parseFloat((predicted + uncertainty).toFixed(2)),
          hour: h
        })
      }

      // Determine safe limit for the type
      const safeLimit = { air: 100, water: 8.5, noise: 75 }[type] || 100
      const exceedanceHours = forecast.filter(f => f.predicted > safeLimit).length

      return reply.send({
        success: true,
        type,
        locationId,
        historical: readings.map(r => ({
          timestamp: new Date(r.timestamp).toISOString(),
          value: parseFloat(r.value.toFixed(2))
        })),
        forecast,
        summary: {
          currentValue: parseFloat(lastAvg.toFixed(2)),
          trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
          trendSlope: parseFloat(slope.toFixed(4)),
          safeLimit,
          exceedanceHours,
          riskLevel: exceedanceHours > 48 ? 'HIGH' : exceedanceHours > 24 ? 'MODERATE' : 'LOW'
        }
      })

    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Forecast failed', details: error.message })
    }
  })

}

export default aiRoutes