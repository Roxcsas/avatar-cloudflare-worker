export interface Env {
	AI: Ai;
}

export default {
	async fetch(request, env): Promise<Response> {

		if (request.method === "OPTIONS") {
			const prerequest = handleOptions(request);
			return prerequest;
		}
		else {
			try {

				if (request.method !== 'POST') {
					return new Response('Method Not Allowed', { status: 405 });
				}

				const { headers } = request;
				const contentType = headers.get('content-type') || '';

				if (contentType.includes('application/json')) {
					const userMsgData: any = await request.json();

					const message = JSON.stringify(userMsgData?.question) || '';

					const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
						max_tokens: 128,
						messages: [
							{ role: "system", content: "You are a helpful assistant" },
							{ role: "user", content: message },
						],
					}
					);

					return new Response(JSON.stringify(response), { headers: corsHeaders });
				} else {
					return new Response('Invalid Content-Type, expected application/json', { status: 400 });
				}
			}
			catch (error) {
				console.error(error);
			}
			return new Response('An error occurred', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;


// Reference: https://developers.cloudflare.com/workers/examples/cors-header-proxy
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
}
function handleOptions(request: Request) {
	let headers = request.headers
	if (
		headers.get("Origin") !== null &&
		headers.get("Access-Control-Request-Method") !== null &&
		headers.get("Access-Control-Request-Headers") !== null
	) {
		// Handle CORS pre-flight request.
		let respHeaders = {
			...corsHeaders,
			"Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || '',
		}
		return new Response(null, {
			headers: respHeaders,
		})
	}
	else {
		// Handle standard OPTIONS request.
		return new Response(null, {
			headers: {
				Allow: "POST, OPTIONS",
			},
		})
	}
}