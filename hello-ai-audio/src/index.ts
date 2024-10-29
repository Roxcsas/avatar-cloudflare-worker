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

				const formData = await request.formData();
				const audioBlob: any = formData.get("audio");

				const audioBuffer = await audioBlob.arrayBuffer();

				const input = {
					audio: [...new Uint8Array(audioBuffer)],
				};

				const response = await env.AI.run(
					"@cf/openai/whisper",
					input
				);

				return new Response(JSON.stringify(response), { headers: corsHeaders });
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