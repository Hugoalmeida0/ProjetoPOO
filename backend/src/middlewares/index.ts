/**
 * Middlewares
 * 
 * Esta pasta contém middlewares reutilizáveis do Express.
 * Middlewares são funções que têm acesso aos objetos de requisição (req),
 * resposta (res) e a próxima função middleware no ciclo de requisição-resposta.
 * 
 * Exemplos de middlewares:
 * - Autenticação JWT
 * - Validação de dados
 * - Logging
 * - Error handling
 * - Rate limiting
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender o tipo Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Verifica se o token JWT é válido e adiciona o userId ao request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded: any = jwt.verify(token, secret);
    
    req.userId = decoded.sub as string;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware de validação de mentor
 * Verifica se o usuário autenticado é um mentor
 */
export const isMentorMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Implementação pendente - verificar na tabela users se is_mentor = true
  next();
};

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Middleware de logging de requisições
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

export default {
  authMiddleware,
  isMentorMiddleware,
  errorHandler,
  requestLogger
};
