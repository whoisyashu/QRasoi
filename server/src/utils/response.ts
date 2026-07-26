import type { Response } from 'express';
export function ok(res:Response,message:string,data:unknown,status=200){return res.status(status).json({success:true,message,data,errors:null,timestamp:new Date().toISOString(),requestId:res.req.requestId});}
export function fail(res:Response,status:number,message:string,errors:unknown=null){return res.status(status).json({success:false,message,data:null,errors,timestamp:new Date().toISOString(),requestId:res.req.requestId});}
