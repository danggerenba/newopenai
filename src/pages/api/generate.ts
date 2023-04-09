import type { APIRoute } from "astro";
import { generatePayload, parseOpenAIStream } from "@/utils/openAI";
import { verifySignature } from "@/utils/auth";
// #vercel-disable-blocks
import { fetch, ProxyAgent } from "undici";
// #vercel-end

const apiKey = import.meta.env.OPENAI_API_KEY;
const httpsProxy = import.meta.env.HTTPS_PROXY;
const baseUrl = (
  import.meta.env.OPENAI_API_BASE_URL || "https://api.openai.com"
)
  .trim()
  .replace(/\/$/, "");
const sitePassword = import.meta.env.SITE_PASSWORD;

export const post: APIRoute = async (context) => {
  context.request.headers;
  const body = await context.request.json();
  const { sign, time, messages, pass } = body;
  if (!messages) {
    return new Response("No input text");
  }
  if (sitePassword && sitePassword !== pass) {
    return new Response("Invalid password");
  }
  if (
    import.meta.env.PROD &&
    !(await verifySignature(
      { t: time, m: messages?.[messages.length - 1]?.content || "" },
      sign
    ))
  ) {
    return new Response("Invalid signature");
  }
  const initOptions = generatePayload(apiKey, messages);
  // #vercel-disable-blocks
  if (httpsProxy) {
    initOptions["dispatcher"] = new ProxyAgent(httpsProxy);
  }
  // #vercel-end

  // @ts-ignore
  const response = (await fetch(
    `${baseUrl}/v1/chat/completions`,
    initOptions
  )) as Response;

  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:5173", // 允许来自 example.com 的跨域请求
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // 允许的 HTTP 方法
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization,User-Agent,Referer,Accept,sec-ch-ua,sec-ch-ua-mobile,sec-ch-ua-platform", // 允许的请求头
    "Access-Control-Allow-Credentials": "true", // 允许携带 cookie
  };
  const res = new Response(parseOpenAIStream(response), { headers });
  console.log("body:", res.body);
  return res;
};
