import test from 'node:test';
import assert from 'node:assert/strict';
import { tasteHandler } from '../api/qloo-taste.js';

function response() {
  const res = { code: 200, headers: {}, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = n => { res.code = n; return res; };
  res.json = value => { res.body = value; return res; };
  return res;
}
const request = (query = {seed: 'entity-123', type: 'urn:entity:brand'}, method = 'GET') => ({query, method});

test('rejects mutation methods without contacting upstream', async () => {
  process.env.QLOO_API_KEY = 'test-only-key';
  const res = response();
  await tasteHandler(request(undefined, 'POST'), res);
  assert.equal(res.code, 405);
});
test('fails closed when key is missing', async () => {
  delete process.env.QLOO_API_KEY;
  const res = response();
  await tasteHandler(request(), res);
  assert.equal(res.code, 503);
  assert.equal(res.body.error, 'qloo_not_configured');
});
test('rejects unsupported type or malformed seed before network', async () => {
  process.env.QLOO_API_KEY = 'test-only-key';
  for (const query of [{seed: 'entity-123', type:'urn:entity:sneaker'}, {seed:'&evil=1'}]) {
    const res = response();
    await tasteHandler(request(query), res);
    assert.equal(res.code, 400);
  }
});
test('calls documented GET insights API, returns only approved fields, no key leaks', async () => {
  process.env.QLOO_API_KEY = 'secret-test-key';
  const prior = globalThis.fetch;
  let observed;
  globalThis.fetch = async (url, init) => {
    observed = {url, init};
    return {ok:true,status:200,json:async()=>({results:{entities:[{id:'qloo-1',name:'Example brand',private_field:'not exposed'}]}})};
  };
  try {
    const res = response();
    await tasteHandler(request(),res);
    assert.equal(res.code,200);
    assert.match(observed.url, /^https:\/\/hackathon\.api\.qloo\.com\/v2\/insights\?/);
    assert.equal(observed.init.method,'GET');
    assert.equal(observed.init.headers['X-Api-Key'],'secret-test-key');
    assert.equal(new URL(observed.url).searchParams.get('signal.interests.entities'),'entity-123');
    assert.equal(res.body.candidates[0].name,'Example brand');
    assert.equal(res.body.candidates[0].private_field,undefined);
    assert.equal(res.body.pricingVerified,false);
    assert.doesNotMatch(JSON.stringify(res.body),/secret-test-key/);
  } finally {globalThis.fetch=prior;}
});
test('safely handles rate limit, upstream error, malformed schema and network outage', async () => {
  process.env.QLOO_API_KEY = 'test-only-key';
  const prior = globalThis.fetch;
  try {
    for (const [reply,code,error] of [
      [{ok:false,status:429},429,'qloo_rate_limited'],
      [{ok:false,status:401},502,'qloo_upstream_error'],
      [{ok:true,status:200,json:async()=>({bad:1})},502,'qloo_unexpected_schema'],
    ]) {
      globalThis.fetch=async()=>reply;
      const res=response();await tasteHandler(request(),res);
      assert.equal(res.code,code);assert.equal(res.body.error,error);
    }
    globalThis.fetch=async()=>{throw new Error('ECONNRESET')};
    const res=response();await tasteHandler(request(),res);
    assert.equal(res.code,502);assert.equal(res.body.error,'qloo_unavailable');
  } finally {globalThis.fetch=prior;}
});
