According to the assignment, the focus has been on functionality and communication. 

I previously had CORS problems so I decided on implementing a proxy server to help me avoid them. 
In ProxyServer/server.js are the actual post requests to https://blackjack.fuzz.me.uk/. 

For a simple, functionality-intended implementation, in Assignment/blackjack.js, the requests are GET requests to this proxy server at the intended path (/turn, /stand etc). Through these GET requests, the proxy server will get the required body data.

For the proxy server, NodeJs has been used.
For the blackjack implementation, vanilla JavaScript. For HTTP requests, Axios and Fetch.
