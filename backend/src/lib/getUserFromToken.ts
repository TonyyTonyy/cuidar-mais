import { NextRequest } from "next/server"
import jwt from 'jsonwebtoken'
export function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido')
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string
  }

  return decoded.userId
}