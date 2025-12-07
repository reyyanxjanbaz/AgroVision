const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust Proxy for Render
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// IP Whitelist Middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const clientIp = req.ip;
    const allowedIps = ['74.220.49.', '74.220.57.'];
    const isAllowed = allowedIps.some(ip => clientIp.startsWith(ip));
    
    console.log(`Client IP: ${clientIp}, Allowed: ${isAllowed}`);
    
    // Uncomment to enforce IP whitelisting
    /*
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied' });
    }
    */
  }
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    const clientIp = req.ip;
    const allowedIps = ['74.220.49.', '74.220.57.'];
    return allowedIps.some(ip => clientIp.startsWith(ip));
  }
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const cropsRoutes = require('./routes/crops');
const chatbotRoutes = require('./routes/chatbot');
const weatherRoutes = require('./routes/weather');

app.use('/api/crops', cropsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/weather', weatherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;