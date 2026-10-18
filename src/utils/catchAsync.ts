import { NextFunction, Request, RequestHandler, response, Response } from 'express';

const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

// const catchAsync=(fn:RequestHandler)=>{
//   return (req:Request,res:Response,next:NextFunction)=>{
//     Promise.resolve(fn(req,res,next)).catch(err=>next(err))
//   }
// }

export default catchAsync;

// const catchAsync=(fn:RequestHandler)=>{
  
//   return async(req:Request,res:Response,next:NextFunction)=>{
//     try{
//       await fn(req,res,next)
//     }catch(err){
//       next(err)
//     }
//   }
  
// }