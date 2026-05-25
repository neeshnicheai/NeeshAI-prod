import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { RagController } from './controllers/RagController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Apply Security Middleware to all /internal routes
import { requireInternalAuth } from './middleware/auth';
app.use('/internal', requireInternalAuth);

// Apply Supabase auth middleware to all /api routes
import { supabaseAuth } from './middleware/supabaseAuth';
app.use('/api', supabaseAuth);

const ragController = new RagController();

// Public API routes (user-facing)
import { ProjectController } from './controllers/ProjectController';
const projectController = new ProjectController();

app.get('/api/projects', (req, res) => projectController.getProjects(req, res));
app.post('/api/projects', (req, res) => projectController.createProject(req, res));
app.get('/api/projects/:id', (req, res) => projectController.getProject(req, res));
app.put('/api/projects/:id', (req, res) => projectController.updateProject(req, res));
app.delete('/api/projects/:id', (req, res) => projectController.deleteProject(req, res));

// Document API routes
import { DocumentController, uploadMiddleware } from './controllers/DocumentController';
const documentController = new DocumentController();

app.get('/api/documents/project/:projectId', (req, res) => documentController.getProjectDocuments(req, res));
app.post('/api/documents/project/:projectId', uploadMiddleware, (req, res) => documentController.uploadDocument(req, res));
app.put('/api/documents/:documentId/replace', uploadMiddleware, (req, res) => documentController.replaceDocument(req, res));
app.post('/api/documents/project/:projectId/refresh', (req, res) => documentController.refreshDocuments(req, res));

// Public health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Neesh AI Service',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ai-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Internal API routes
app.post('/internal/ingest/:projectId', (req, res) => ragController.ingestProject(req, res));
app.post('/internal/query', (req, res) => ragController.queryVectorStore(req, res));
app.post('/internal/chat', (req, res) => ragController.chatWithProject(req, res));

// RAG Analytics + Cache Management routes
app.get('/internal/projects/:projectId/rag-analytics', (req, res) => ragController.getProjectRagAnalytics(req, res));
app.get('/internal/rag-analytics/global', (req, res) => ragController.getGlobalRagAnalytics(req, res));
app.get('/internal/rag-analytics/cache', (req, res) => ragController.getCacheStats(req, res));
app.delete('/internal/projects/:projectId/cache', (req, res) => ragController.invalidateProjectCache(req, res));

// Learning Loop Routes
import { LearningController } from './controllers/LearningController';
const learningController = new LearningController();
app.post('/internal/feedback', (req, res) => learningController.submitFeedback(req, res));
app.post('/internal/manual-answer', (req, res) => learningController.submitManualAnswer(req, res));
app.get('/internal/notifications/:projectId', (req, res) => learningController.getNotifications(req, res));

// Insight Routes
import { InsightController } from './controllers/InsightController';
const insightController = new InsightController();
app.get('/internal/projects/:projectId/health', (req, res) => insightController.getProjectHealth(req, res));
app.get('/internal/projects/:projectId/readiness', (req, res) => insightController.getReadiness(req, res));
app.get('/internal/projects/:projectId/risks', (req, res) => insightController.getRisks(req, res));


app.listen(port, () => {
    console.log(`AI Service running on port ${port}`);
});
