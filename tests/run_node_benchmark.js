/**
 * QRasoi Production Live Performance & Load Benchmark Runner (Node.js Native)
 * Target: https://qrasoi.onrender.com/api
 *
 * Runs real-time concurrent multi-role load tests against live deployed backend.
 */

const TARGET_URL = process.env.TARGET_URL || 'https://qrasoi.onrender.com/api';
const RESTAURANT_SLUG = process.env.RESTAURANT_SLUG || 'dineverse-bistro';

const TEST_OWNER = {
  email: 'maheshwariy071@gmail.com',
  password: '7983346809@Yash',
};

const TEST_CHEF = {
  email: 'chef.dineverse@qrasoi.app',
  password: '7983346809@Yash',
};

// Metric accumulators
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  latencies: [],
  cacheLatencies: [],
  orderPlacementLatencies: [],
};

function resetStats() {
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    latencies: [],
    cacheLatencies: [],
    orderPlacementLatencies: [],
  };
}

async function request(url, options = {}) {
  const start = performance.now();
  stats.totalRequests++;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const duration = performance.now() - start;
    stats.latencies.push(duration);

    if (res.ok) {
      stats.successfulRequests++;
      let data = null;
      try {
        data = await res.json();
      } catch {}
      return { ok: true, status: res.status, duration, data };
    } else {
      stats.failedRequests++;
      return { ok: false, status: res.status, duration, data: null };
    }
  } catch (err) {
    const duration = performance.now() - start;
    stats.latencies.push(duration);
    stats.failedRequests++;
    return { ok: false, status: 0, duration, data: null, error: err.message };
  }
}

function computePercentiles(arr) {
  if (!arr || arr.length === 0) return { min: 0, mean: 0, median: 0, p95: 0, p99: 0, max: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  const getP = (p) => sorted[Math.floor((p / 100) * sorted.length)] || sorted[sorted.length - 1];

  return {
    min: sorted[0].toFixed(2),
    mean: (sum / sorted.length).toFixed(2),
    median: getP(50).toFixed(2),
    p95: getP(95).toFixed(2),
    p99: getP(99).toFixed(2),
    max: sorted[sorted.length - 1].toFixed(2),
  };
}

function printSummary(profileName, durationSec) {
  const perf = computePercentiles(stats.latencies);
  const cachePerf = computePercentiles(stats.cacheLatencies);
  const orderPerf = computePercentiles(stats.orderPlacementLatencies);
  const rps = (stats.totalRequests / durationSec).toFixed(2);
  const errorRate = ((stats.failedRequests / (stats.totalRequests || 1)) * 100).toFixed(2);

  console.log(`\n================================================================`);
  console.log(`📊 PERFORMANCE BENCHMARK REPORT: ${profileName.toUpperCase()}`);
  console.log(`📡 Target API: ${TARGET_URL}`);
  console.log(`================================================================`);
  console.log(`⏱️ Duration: ${durationSec}s | Concurrency Workers Active`);
  console.log(`📈 Total Requests Sent: ${stats.totalRequests}`);
  console.log(`✅ Successful Requests: ${stats.successfulRequests}`);
  console.log(`❌ Failed Requests: ${stats.failedRequests} (Error Rate: ${errorRate}%)`);
  console.log(`🚀 Throughput: ${rps} req/sec`);
  console.log(`----------------------------------------------------------------`);
  console.log(`⏱️ Global Latency (ms):`);
  console.log(`   - Min: ${perf.min}ms | Mean: ${perf.mean}ms | Median: ${perf.median}ms`);
  console.log(`   - P95 SLA (<500ms): ${perf.p95}ms ${Number(perf.p95) < 500 ? '✅ PASSED' : '⚠️ HIGH LATENCY'}`);
  console.log(`   - P99 SLA (<1500ms): ${perf.p99}ms ${Number(perf.p99) < 1500 ? '✅ PASSED' : '⚠️ HIGH LATENCY'}`);
  console.log(`   - Max Latency: ${perf.max}ms`);
  if (stats.cacheLatencies.length > 0) {
    console.log(`----------------------------------------------------------------`);
    console.log(`⚡ Public Menu Cache Speed (ms):`);
    console.log(`   - Mean: ${cachePerf.mean}ms | P95: ${cachePerf.p95}ms ${Number(cachePerf.p95) < 200 ? '✅ CACHE ACTIVE (<200ms)' : '⚠️ UNCACHED'}`);
  }
  if (stats.orderPlacementLatencies.length > 0) {
    console.log(`----------------------------------------------------------------`);
    console.log(`🛒 Order Placement Speed (ms):`);
    console.log(`   - Mean: ${orderPerf.mean}ms | P95: ${orderPerf.p95}ms`);
  }
  console.log(`================================================================\n`);
}

/**
 * Worker simulating a customer: browse menu -> place order -> track order
 */
async function customerWorker(stopSignal) {
  while (!stopSignal.done) {
    // 1. Browse Public Menu (Cache evaluation)
    const menuStart = performance.now();
    const menuRes = await request(`${TARGET_URL}/public/r/${RESTAURANT_SLUG}`);
    if (menuRes.ok) {
      stats.cacheLatencies.push(performance.now() - menuStart);
    }

    // 2. Place Customer Order
    const randomTable = `Table ${Math.floor(Math.random() * 10) + 1}`;
    const orderStart = performance.now();
    const orderRes = await request(`${TARGET_URL}/public/orders`, {
      method: 'POST',
      body: JSON.stringify({
        restaurantSlug: RESTAURANT_SLUG,
        customerName: 'LoadTester Customer',
        customerPhone: '9876543210',
        tableNumber: randomTable,
        items: [{ id: 'item-1', name: 'Paneer Tikka', price: 140, quantity: 1 }],
        subtotal: 140,
      }),
    });

    let createdId = null;
    if (orderRes.ok && orderRes.data && orderRes.data.orderId) {
      stats.orderPlacementLatencies.push(performance.now() - orderStart);
      createdId = orderRes.data.orderId;
    }

    // 3. Track Status
    if (createdId) {
      await request(`${TARGET_URL}/public/orders/${createdId}`);
    }

    await new Promise((r) => setTimeout(r, 200));
  }
}

/**
 * Worker simulating a restaurant owner: login -> fetch orders -> verify payment
 */
async function ownerWorker(stopSignal) {
  let token = null;

  // Login
  const loginRes = await request(`${TARGET_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(TEST_OWNER),
  });

  if (loginRes.ok && loginRes.data && loginRes.data.token) {
    token = loginRes.data.token;
  }

  while (!stopSignal.done) {
    if (token) {
      // Fetch live orders
      const ordersRes = await request(`${TARGET_URL}/owner/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Verify payment if pending orders exist
      if (ordersRes.ok && Array.isArray(ordersRes.data) && ordersRes.data.length > 0) {
        const pending = ordersRes.data.find((o) => !o.isPaymentVerified);
        if (pending) {
          await request(`${TARGET_URL}/owner/orders/${pending.id}/verify-payment`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
    }

    await new Promise((r) => setTimeout(r, 300));
  }
}

/**
 * Run a load scenario profile with N concurrency workers for D seconds
 */
async function runProfile(profileName, concurrency, durationSec) {
  console.log(`\n🚀 Starting Profile: ${profileName} (${concurrency} Concurrent Workers for ${durationSec}s)...`);
  resetStats();

  const stopSignal = { done: false };
  const workers = [];

  for (let i = 0; i < concurrency; i++) {
    if (i % 2 === 0) {
      workers.push(customerWorker(stopSignal));
    } else {
      workers.push(ownerWorker(stopSignal));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, durationSec * 1000));
  stopSignal.done = true;

  await Promise.all(workers).catch(() => {});
  printSummary(profileName, durationSec);
}

async function main() {
  console.log(`\n================================================================`);
  console.log(`🔥 QRASOI PRODUCTION DEPLOYMENT LOAD TESTER`);
  console.log(`📡 Deployed Target: ${TARGET_URL}`);
  console.log(`================================================================`);

  // Profile 1: Baseline Low Traffic (5 Workers, 10s)
  await runProfile('1. Low Traffic Baseline (5 VUs)', 5, 10);

  // Profile 2: Medium Traffic Rush (15 Workers, 12s)
  await runProfile('2. Medium Traffic Rush (15 VUs)', 15, 12);

  // Profile 3: Peak Rush Hour Stress (30 Workers, 15s)
  await runProfile('3. Peak Rush Hour Stress (30 VUs)', 30, 15);

  // Profile 4: Chained Real-World Restaurant Day Simulation (20 Workers, 15s)
  await runProfile('4. Chained Real-World Restaurant Day Simulation (20 VUs)', 20, 15);

  console.log(`\n🎉 Load Testing Complete! Target URL: ${TARGET_URL}\n`);
}

main();
