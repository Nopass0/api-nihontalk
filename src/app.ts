import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/user.routes';
import { courseRouter } from './routes/course.routes';
import { adminRouter } from './routes/admin.routes';
import { flashcardRouter } from './routes/flashcard.routes';
import { testRouter } from './routes/test.routes';
import { premiumRouter } from './routes/premium.routes';
import { errorHandler } from './middleware/error.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/admin', adminRouter);
app.use('/api/flashcards', flashcardRouter);
app.use('/api/tests', testRouter);
app.use('/api/premium', premiumRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;