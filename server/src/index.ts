import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from './routes/auth.routes';
import leadsRoutes from './routes/leads.routes';
import contactsRoutes from './routes/contacts.routes';
import companiesRoutes from './routes/companies.routes';
import productsRoutes from './routes/products.routes';
import notesRoutes from './routes/notes.routes';
import statsRoutes from './routes/stats.routes';
import usersRoutes from './routes/users.routes';

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // TODO: restrict in production
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
});
app.use(limiter);

import pipelinesRoutes from './routes/pipelines.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pipelines', pipelinesRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
