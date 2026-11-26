import proxy from "express-http-proxy"



export const proxyWithHeaders = (serviceUrl) => {
    return proxy(
        serviceUrl, 
        {
            proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
                if(srcReq.user) {
                    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
                }
                return proxyReqOpts

            }
        }
    )
}



/*
    - those params "serviceUrl" is like -> we call proxyWithHeaders(function) in "index.js" like :-

        proxyWithHeaders(process.env.RESUME_SERVICE_URL)

*/