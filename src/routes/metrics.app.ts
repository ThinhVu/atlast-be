import { collectDefaultMetrics, register } from 'prom-client';
import {Request, Response} from "hyper-express";
import {Router} from "hyper-express";
import { Server, Socket } from 'socket.io';
import {startMongoTop, stopMongoTop} from '../logic/metric/mongotop'
import {startMongoStats, stopMongoStats} from '../logic/metric/mongostats'






export default async function(app) {
  console.log('[app-route] metrics')
  collectDefaultMetrics();

  app.get('/metrics', async (_req: Request, res: Response) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  })
}