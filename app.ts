import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './logger';

const app = express();

app.use(cors());

app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
  }),
);

// app.use('/auth', authRoutes);

// app.use('/users', userRoutes);

// app.use('/recipients', recipientRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ronda API',
  });
});

app.use((err, req, res, next) => {
  if (err instanceof Error) {
    logger.error(err);
    res.status(500).json({
      error: err,
    });
  } else {
    next(err);
  }
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

export default app;
