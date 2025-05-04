import { config } from "dotenv";
import express from "express";
import httpProxy from "http-proxy";
import { authenticateToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

const apiGateway = express();
const proxy = httpProxy.createProxyServer();

apiGateway.use(cookieParser());
apiGateway.use(cors());

// Colors for logs
const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    green: "\x1b[32m",
    blue: "\x1b[34m"
};

const consoleLog = (message, color) => {
    console.log(`${color}${message}${colors.reset}`);
};

apiGateway.use('/api/auth', (req, res) => {
  const originalUrl = req.originalUrl; // This gives you the full URL path
  const targetPath = originalUrl; // Keep the full path
  const targetUrl = process.env.AUTH_SERVICE;
  
  consoleLog(`Request sent to AUTH service for ${req.method} ${targetPath}`, colors.green);
  console.log('Forwarding to:', targetUrl + targetPath);  
  req.url = targetPath; // Override the URL
  proxy.web(req, res, { target: targetUrl });
});

apiGateway.use('/api/users', (req, res) => {
    const originalUrl = req.originalUrl; // This gives you the full URL path
    const targetPath = originalUrl; // Keep the full path
    const targetUrl = process.env.AUTH_SERVICE;
    
    consoleLog(`Request sent to AUTH service for ${req.method} ${targetPath}`, colors.green);
    console.log('Forwarding to:', targetUrl + targetPath);  
    req.url = targetPath; // Override the URL
    proxy.web(req, res, { target: targetUrl });
  });

// Authentication middleware for other /api routes
apiGateway.use('/api', authenticateToken);

// RESTAURANT service
apiGateway.use(['/api/restaurants', '/api/menus'], (req, res) => {
    const originalUrl = req.originalUrl; // This gives you the full URL path
    const targetPath = originalUrl; // Define targetPath
    const targetUrl = process.env.RESTAURANT_SERVICE;
    
    consoleLog(`Request sent to RESTAURANT service at ${targetUrl}`, colors.cyan);
    console.log('Forwarding to:', targetUrl + targetPath);
    req.url = targetPath; // Now targetPath is defined
    proxy.web(req, res, { target: targetUrl });
  });


// ORDER service
apiGateway.use(['/api/orders', '/api/confirmed-orders'], (req, res) => {
    const originalUrl = req.originalUrl; // This gives you the full URL path
    const targetPath = originalUrl; // Define targetPath
    const targetUrl = process.env.ORDER_SERVICE;
    
    consoleLog(`Request sent to ORDER service at ${targetUrl}`, colors.cyan);
    console.log('Forwarding to:', targetUrl + targetPath);
    req.url = targetPath; // Now targetPath is defined
    proxy.web(req, res, { target: targetUrl });
  });

// // ORDER service
// apiGateway.use('/api/order', (req, res) => {
//     consoleLog(`Request sent to ORDER service`, colors.yellow);
//     proxy.web(req, res, { target: process.env.ORDER_SERVICE });
// });

// PAYMENT service
apiGateway.use('/api/payment', (req, res) => {
    consoleLog(`Request sent to PAYMENT service`, colors.magenta);
    proxy.web(req, res, { target: process.env.PAYMENT_SERVICE });
});

// DELIVERY service
apiGateway.use(['/api/delivery', '/api/deliveries'], (req, res) => {
    const originalUrl = req.originalUrl; // This gives you the full URL path
    const targetPath = originalUrl; // Keep the full path
    const targetUrl = process.env.DELIVERY_SERVICE;
    
    consoleLog(`Request sent to DELIVERY service for ${req.method} ${targetPath}`, colors.blue);
    console.log('Forwarding to:', targetUrl + targetPath);
    req.url = targetPath; // Override the URL
    proxy.web(req, res, { target: targetUrl });
});
// Proxy error handler
proxy.on('error', (error, req, res) => {
    console.error('Proxy Error:', error);
    res.status(500).send('Proxy Error');
});

// Start server
apiGateway.listen(process.env.API_GATEWAY_PORT, () => {
    console.log(`API Gateway running at http://localhost:${process.env.API_GATEWAY_PORT}`);
});
