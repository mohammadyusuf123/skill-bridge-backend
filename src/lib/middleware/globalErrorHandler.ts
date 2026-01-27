import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../../generated/prisma/client";

function errorHandler(err: any, req:Request, res:Response, next: NextFunction) {
   let statusCode = 500;
   let errorMessage = "Internal Server Error";
   let error = err;
   //PrismaClientValidationError
   if(err instanceof Prisma.PrismaClientValidationError){
       statusCode = 400;
       errorMessage = 'You provided incorrect field type or missing required fields';
       error = err
   }
   if(err instanceof Prisma.PrismaClientKnownRequestError){
      if(err.code === 'P2002'){
        statusCode = 400;
        errorMessage = 'Duplicate entry';
        error = err
      }
      else if(err.code === 'P2003'){
        statusCode = 400;
        errorMessage = 'You provided incorrect field type or missing required fields';
        error = err
      }
       
   }
   if(err instanceof Prisma.PrismaClientUnknownRequestError){
      statusCode = 400;
      errorMessage = 'You provided incorrect field type or missing required fields';
      error = err
   }
   if(err instanceof Prisma.PrismaClientRustPanicError){
      statusCode = 400;
      errorMessage = 'You provided incorrect field type or missing required fields';
      error = err
   }

   res.status(statusCode).json({ 
    message: errorMessage,
    error: error
   });
}

export default errorHandler