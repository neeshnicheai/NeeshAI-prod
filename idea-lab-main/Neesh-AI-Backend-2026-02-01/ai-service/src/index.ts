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

const ragController = new RagController();

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
