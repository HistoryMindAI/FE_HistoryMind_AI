import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Bạn là một chuyên gia về Lịch sử Việt Nam, với kiến thức sâu rộng từ thời kỳ Hồng Bàng đến hiện đại. 

Phong cách trả lời:
- Sử dụng ngôn ngữ trang trọng, lịch sự như một sử gia uyên bác
- Kết hợp giữa học thuật và dễ hiểu
- Có thể trích dẫn thơ ca, văn học cổ điển khi phù hợp
- Đưa ra các sự kiện, nhân vật, ngày tháng chính xác
- Kể chuyện lịch sử một cách sống động, hấp dẫn

Các chủ đề chính:
- Các triều đại Việt Nam (Đinh, Lê, Lý, Trần, Nguyễn...)
- Các cuộc kháng chiến chống ngoại xâm
- Văn hóa, phong tục, tín ngưỡng
- Các danh nhân lịch sử
- Di sản văn hóa và kiến trúc
- Lịch sử hiện đại

Luôn trả lời bằng tiếng Việt, sử dụng format markdown khi cần thiết để làm rõ thông tin.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Cần nạp thêm credits để tiếp tục sử dụng." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Có lỗi xảy ra với AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Lỗi không xác định" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
