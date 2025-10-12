// Basic OpenTelemetry initialization (console export for now) + minimal manual span helpers
let NodeSDK;
try { ({ NodeSDK } = require('@opentelemetry/sdk-node')); } catch(_) { NodeSDK = null; }
let getNodeAutoInstrumentations = null; // optional dependency
try { ({ getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')); } catch(_) { getNodeAutoInstrumentations = null; }
let otlpExporter = null;
let otlpMetricsExporter = null;
try {
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    otlpExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/$/, '') + '/v1/traces',
      headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : undefined,
    });
    try {
      const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
      otlpMetricsExporter = new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/$/, '') + '/v1/metrics',
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : undefined,
      });
    } catch (e2) {
      console.warn('[otel] metrics exporter init failed:', e2.message);
    }
  }
} catch (e) {
  console.warn('[otel] OTLP exporter init failed:', e.message);
}
let sdkStarted = false;
let sdk = null;
let api;
let meterApi;
let counters = {};

async function initTelemetry() {
  if (sdkStarted) return sdk;
  try {
    api = require('@opentelemetry/api');
    if (!NodeSDK) throw new Error('OTel SDK not installed');
    const serviceName = process.env.OTEL_SERVICE_NAME || 'ecommerce-backend';
    let resource;
    try {
      const { Resource } = require('@opentelemetry/resources');
      resource = new Resource({ 'service.name': serviceName });
    } catch(_) { resource = undefined; }
    const instrumentations = [];
    if (getNodeAutoInstrumentations) {
      try { instrumentations.push(getNodeAutoInstrumentations()); } catch(ei) { console.warn('[otel] auto-instrumentations init failed:', ei.message); }
    }
    sdk = new NodeSDK({
      resource,
      traceExporter: otlpExporter || undefined,
      metricExporter: otlpMetricsExporter || undefined,
      instrumentations,
    });
    await sdk.start();
    sdkStarted = true;
    // Initialize meters & counters lazily after SDK start
    try {
      meterApi = api.metrics.getMeter(serviceName);
      counters.paymentsCreated = meterApi.createCounter('payments.intent.created', { description: 'Payment intents successfully created (stub or real)' });
      counters.paymentsFailed = meterApi.createCounter('payments.intent.failed', { description: 'Payment intent failures (real or simulated)' });
      counters.ordersCreated = meterApi.createCounter('orders.created', { description: 'Orders created' });
      counters.ordersIdempotentReuse = meterApi.createCounter('orders.idempotent_reuse', { description: 'Idempotent order reuse occurrences' });
    } catch(e) { console.warn('[otel] meter init failed:', e.message); }
    return sdk;
  } catch (e) {
    console.warn('[otel] init failed:', e.message);
    // Ensure counters exist even if SDK fails (no-op)
    if (!counters.paymentsCreated) {
      counters.paymentsCreated = { add: ()=>{} };
      counters.paymentsFailed = { add: ()=>{} };
      counters.ordersCreated = { add: ()=>{} };
      counters.ordersIdempotentReuse = { add: ()=>{} };
    }
  }
}

function getTracer() {
  try {
    if (!api) api = require('@opentelemetry/api');
    return api.trace.getTracer(process.env.OTEL_TRACER_NAME || 'app');
  } catch (_) {
    return { startSpan: (n)=>({ end:()=>{}, setAttribute:()=>{}, recordException:()=>{}, setStatus:()=>{} }) };
  }
}

function withSpan(name, fn, attrs) {
  const tracer = getTracer();
  const span = tracer.startSpan(name, { attributes: attrs || {} });
  return Promise.resolve()
    .then(()=> fn(span))
    .then((res)=> { span.end(); return res; })
    .catch(err => { try { span.recordException(err); span.setStatus({ code: 2, message: err.message }); } catch(_){} span.end(); throw err; });
}

function shutdownTelemetry() {
  if (sdk) {
    sdk.shutdown().catch(()=>{});
  }
}

function record(metricName, value=1, attrs) {
  try {
    if (!counters[metricName]) return;
    counters[metricName].add(value, attrs);
  } catch(_) {}
}

function getMetrics() { return counters; }

module.exports = { initTelemetry, shutdownTelemetry, withSpan, record, getMetrics };
