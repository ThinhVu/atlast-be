import {MiddlewareNext, Request, Response} from 'hyper-express';

type SafeCallHandler<T> = (req: Request, res: Response, next: MiddlewareNext) => Promise<T>;
type SafeCallResponse = (req: Request, res: Response, next: MiddlewareNext) => Promise<void>;

export default function safeCall<T>(fn: SafeCallHandler<T>): SafeCallResponse {
   return async (req, res, next) => {
      try {
         const rs = await fn(req, res, next)
         res.json(rs)
      } catch (e: any) {
         res.status(400).json({error: `${e?.constructor?.name}: ${e.message}`})
      }
   }
}
