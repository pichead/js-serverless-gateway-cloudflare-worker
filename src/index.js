export default {
	async fetch(request, env, ctx) {
		console.log("API_ARR : ", env.API_ARR)
		const apis = JSON.parse(env.API_ARR);

		let body = await request.clone().arrayBuffer();

		const url = new URL(request.url);
		const pathname = url.pathname;
		const queryParams = url.search;

		for (let api of apis) {
			try {
				// เช็ค API `/health/check`
				const health = await fetch(api + '/api/v1/health/check', {
					method: 'HEAD',
					headers: request.headers,
				});

				// ถ้า API ใช้งานได้ -> Forward request ไปที่ API นั้น
				if (health.ok) {
					const apiUrl = `${api}${pathname}${queryParams}`; // รวม Query Params เข้าไป

					const response = await fetch(apiUrl, {
						method: request.method,
						headers: request.headers,
						body: body.byteLength > 0 ? body : null, // ถ้ามี body ให้ส่งไปด้วย
					});

					// ส่ง Response กลับ
					return new Response(response.body, {
						status: response.status,
						headers: response.headers,
					});
				}
			} catch (error) {
				console.log(`Error calling ${api}:`, error);
			}
		}

		return new Response(JSON.stringify({
			statusCode: 503,
			messageEn: "Service Unavailable",
			messageTh: "ไม่สามารถเชื่อมต่อ server ได้"
		}), {
			status: 503,
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
