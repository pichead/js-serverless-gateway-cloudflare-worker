export default {
	async fetch(request, env, ctx) {
		const apis = JSON.parse(env.API_ARR);
		const isHealthCheck = env.IS_HEALTH_CHECK === "true"
		const healthCheckPath = env.HEALTH_CHECK_PATH || ""
		const isHeaderRemove = env.IS_HEADER_REMOVE === "true"

		const serverLen = apis.length
		const random = Math.floor(Math.random() * serverLen)
		const selectEnpoint = apis[random]


		let body = await request.clone().arrayBuffer();

		const url = new URL(request.url);
		const pathname = url.pathname;
		const queryParams = url.search;

		for (let api of apis) {
			try {

				if (isHealthCheck) {
					// เช็ค API `/health/check`
					const health = await fetch(api + healthCheckPath, {
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
				}
				else {
					const apiUrl = `${api}${pathname}${queryParams}`; // รวม Query Params เข้าไป

					const newHeaders = new Headers(request.headers);
					newHeaders.delete('cf-connecting-ip');
					newHeaders.delete('x-real-ip');
					newHeaders.delete('true-client-ip');

					const response = await fetch(apiUrl, {
						method: request.method,
						headers: isHeaderRemove ? newHeaders : request.headers,
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
