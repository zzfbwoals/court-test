export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { plaintiff, defendant, plaintiffName, defendantName, lang = "ko" } = await request.json();

    const pName = plaintiffName || (lang === "ko" ? "원고" : "Plaintiff");
    const dName = defendantName || (lang === "ko" ? "피고" : "Defendant");

    // 기본 필수값 확인
    if (!plaintiff || !defendant) {
      return new Response(JSON.stringify({ error: lang === "ko" ? "원고와 피고의 주장이 필요합니다." : "Plaintiff and defendant claims are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 이름 길이 확인
    if (pName.trim().length < 2 || dName.trim().length < 2) {
      return new Response(JSON.stringify({ error: lang === "ko" ? "이름은 최소 2자 이상이어야 합니다." : "Names must be at least 2 characters long." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 주장 길이 및 단어 수 확인
    const wordCount = (str) => str.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (plaintiff.trim().length < 10 || wordCount(plaintiff) < 2 || defendant.trim().length < 10 || wordCount(defendant) < 2) {
      return new Response(JSON.stringify({ error: lang === "ko" ? "주장은 최소 10자 이상, 2단어 이상이어야 합니다." : "Claims must be at least 10 characters long and contain at least 2 words." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API Key is not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = lang === "ko" 
      ? `
      당신은 "누구 잘못?" (Who's at Fault?)이라는 유머러스한 법정의 "AI 판사"입니다.
      친구 나 연인 사이의 사소한 다툼을 엄숙하면서도 재치 있게 판결하는 것이 당신의 업무입니다.
      
      원고 이름: "${pName}"
      원고 주장: "${plaintiff}"
      
      피고 이름: "${dName}"
      피고 주장: "${defendant}"
      
      다음 JSON 형식으로 판결을 내려주세요:
      {
        "winner": "승자의 실제 이름 ('${pName}' 또는 '${dName}')",
        "title": "사건에 대한 창의적이고 웃긴 죄명/제목 (예: '소스 눅눅함 방조죄')",
        "text": "'${pName}'과 '${dName}'의 이름을 명시하여, 격식 있으면서도 유머러스한 판결문(3~4문장)을 한국어로 작성하세요.",
        "punishment": "패자(이기지 못한 사람)가 승자를 위해 수행해야 하는 가볍고 재미있는 형량이나 벌칙."
      }
      
      중요 규칙: 벌칙(punishment)은 반드시 패자가 승자를 위해 해야 하는 일이어야 합니다. 승자에게 벌을 주지 마세요.
      응답은 반드시 JSON 객체로만 하세요.
      `
      : `
      You are an "AI Judge" in a humorous court called "Who's at Fault?".
      Your job is to settle minor disputes between friends or couples with a mix of solemnity and wit.
      
      Plaintiff's Name: "${pName}"
      Plaintiff's Claim: "${plaintiff}"
      
      Defendant's Name: "${dName}"
      Defendant's Claim: "${defendant}"
      
      Please provide a judgment in the following JSON format:
      {
        "winner": "The actual name of the winner (either '${pName}' or '${dName}')",
        "title": "A creative and funny title for the crime/case (e.g., 'The Crime of Sogginess Negligence')",
        "text": "A 3-4 sentence formal yet humorous verdict explanation in English, explicitly using the names '${pName}' and '${dName}'.",
        "punishment": "A funny and lighthearted punishment or penalty that MUST be performed by the LOSER for the benefit of the winner."
      }
      
      CRITICAL RULE: The "punishment" must ALWAYS be an obligation or task for the LOSER to do for the winner. NEVER punish the winner.
      Respond ONLY with the JSON object.
      `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message || "Gemini API Error");
    }

    const verdict = JSON.parse(data.candidates[0].content.parts[0].text);

    return new Response(JSON.stringify(verdict), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
