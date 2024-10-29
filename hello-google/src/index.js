

export default {
	async fetch(request, env, ctx) {

		if (request.method === "OPTIONS") {
			const prerequest = handleOptions(request);
			return prerequest;
		}

		else {
			const apiUrl = `https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize?key=${env.GOOGLE_API_KEY}`;

			// Create a new request to Google TTS API with the text
			const newRequest = new Request(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
				},
				// Pass the incoming request body directly
				body: request.body,
			});

			// Fetch the response from the Google TTS API
			const response = await fetch(newRequest);

			return new Response(response.body, {
				headers: {
					...response.headers,
					...corsHeaders
				}
			});
		}
	},
};

// Reference: https://developers.cloudflare.com/workers/examples/cors-header-proxy
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400",
}
function handleOptions(request) {
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