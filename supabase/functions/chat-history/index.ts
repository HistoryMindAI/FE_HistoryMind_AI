import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    // KẾT NỐI TRỰC TIẾP ĐẾN SPRING BOOT
    // Lưu ý: Nếu deploy lên Supabase Cloud, thay localhost bằng URL Ngrok của bạn
    const SPRING_BOOT_URL = "http://localhost:8080/api/chat"; 

    console.log("Forwarding request to Spring Boot:", lastUserMessage);

    const response = await fetch(SPRING_BOOT_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        query: lastUserMessage // Khớp với DTO 'query' trong Java
      }),
    });

    if (!response.ok) {
      throw new Error(`Spring Boot Error: ${response.status}`);
    }

    const data = await response.json();

    // Trả về JSON cho Frontend
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Deno Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});