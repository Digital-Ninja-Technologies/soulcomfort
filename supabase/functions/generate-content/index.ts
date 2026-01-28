import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const moodPrompts: Record<string, string> = {
  peaceful:
    "The user is seeking peace, rest, and quiet communion with God. Provide content about stillness, God's presence, and inner calm.",
  anxious:
    "The user is feeling anxious and worried. Provide comforting content about God's protection, casting worries on Him, and finding peace in turbulent times.",
  grateful:
    "The user is feeling grateful and thankful. Provide content celebrating God's blessings, thanksgiving prayers, and joyful praise.",
  grieving:
    "The user is grieving and mourning. Provide gentle, compassionate content about God's comfort in loss, hope in sorrow, and the promise of eternal life.",
  joyful:
    "The user is feeling joyful and celebratory. Provide uplifting content about praising God, celebrating His goodness, and sharing joy with others.",
  seeking:
    "The user is seeking guidance and direction. Provide content about discerning God's will, wisdom from Scripture, and trusting in divine guidance.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mood } = await req.json();

    if (!mood || !moodPrompts[mood]) {
      return new Response(
        JSON.stringify({ error: "Invalid mood provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are a compassionate spiritual guide who provides church-related content to comfort and inspire believers. Your responses should include:

1. A relevant Bible verse (with book, chapter, and verse reference)
2. A brief reflection or meditation on the verse (2-3 sentences)
3. A short prayer (3-5 sentences)
4. An encouraging closing thought

Format your response in Markdown with clear headings (## for each section). Use blockquotes (>) for the Bible verse. Keep the tone warm, pastoral, and authentic to Christian tradition.

${moodPrompts[mood]}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Please provide spiritual content for someone who is feeling ${mood}. Include a Bible verse, reflection, prayer, and encouragement.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);

      if (status === 429) {
        return new Response(
          JSON.stringify({
            error: "Too many requests. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (status === 402) {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable. Please try again later.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully generated content for mood:", mood);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
