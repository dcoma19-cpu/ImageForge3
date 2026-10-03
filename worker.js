const MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/generate") {
      return generate(request, env);
    }

    // Static files (including /) are served by Cloudflare Workers Static Assets.
    return env.ASSETS.fetch(request);
  },
};

async function generate(request, env) {
  try {
    const form = await request.formData();
    const prompt = String(form.get("prompt") || "").trim();
    const ratio = String(form.get("ratio") || "9:16");
    const file = form.get("image");

    if (!prompt) return json({ error: "Enter a prompt first." }, 400);
    if (prompt.length > 2000) return json({ error: "Prompt is too long." }, 400);
    if (!(file instanceof File)) return json({ error: "Upload an image first." }, 400);
    if (!file.size) return json({ error: "The uploaded image is empty." }, 400);
    if (file.size > MAX_UPLOAD_BYTES) {
      return json({ error: "Please use an image smaller than 10 MB." }, 413);
    }

    const dims = {
      "9:16": [768, 1344],
      "1:1": [1024, 1024],
      "4:5": [896, 1120],
      "16:9": [1344, 768],
    }[ratio] || [768, 1344];

    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
    }

    const result = await env.AI.run(MODEL, {
      prompt,
      image_b64: btoa(binary),
      width: dims[0],
      height: dims[1],
      num_steps: 20,
      strength: 0.72,
      guidance: 7.5,
    });

    if (!result?.image) {
      return json({ error: "The image model returned no image." }, 502);
    }

    return json({ image: `data:image/png;base64,${result.image}` });
  } catch (error) {
    console.error(error);
    return json({ error: "Generation failed. Please try again." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
