export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    // 8자리의 짧은 랜덤 ID 생성
    const id = crypto.randomUUID().split('-')[0];
    
    // KV에 저장 (30일 후 자동 삭제 설정으로 관리 효율화 가능)
    // env.VERDICTS는 wrangler.toml에서 설정할 바인딩 이름입니다.
    await env.VERDICTS.put(id, JSON.stringify(data), {
      expirationTtl: 60 * 60 * 24 * 30 // 30일 유지
    });
    
    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  try {
    const data = await env.VERDICTS.get(id);
    if (!data) {
      return new Response(JSON.stringify({ error: "Verdict not found" }), { status: 404 });
    }
    return new Response(data, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
