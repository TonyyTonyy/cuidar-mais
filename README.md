CuidarMais

Aplicativo de gerenciamento de medicamentos para idosos e acompanhamento familiar

Sobre o Projeto
O CuidarMais é uma solução completa para gerenciamento de medicamentos voltada especialmente para idosos e seus familiares. O aplicativo permite que os usuários cadastrem seus medicamentos, configurem lembretes personalizados e, principalmente, que familiares possam monitorar remotamente a adesão ao tratamento de seus entes queridos.

Tecnologias
Frontend (Mobile)
{
  "framework": "React Native + Expo",
  "language": "TypeScript",
  "ui-library": "Gluestack UI v2",
  "styling": "NativeWind (Tailwind CSS)",
  "icons": "@expo/vector-icons",
  "navigation": "Expo Router",
}
Backend (API)
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "orm": "Prisma",
  "database": "PostgreSQL",
  "auth": "NextAuth.js",
  "validation": "Zod"
}

Instalação
Pré-requisitos

Node.js 18+
PostgreSQL 14+
Expo CLI
Conta Google Cloud (para OAuth)

1. Clone o Repositório

2. Configuração do Backend
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
Edite o arquivo .env:
env# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cuidarmais"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"
Execute as migrações:
bashnpx prisma generate
npx prisma migrate dev
3. Inicie o servidor:
pnpm run dev

# Configuração do Frontend
pnpm install

4. Inicie o app:
pnpx expo start

Endpoints Principais
Familiares
GET    /api/family                    # Listar familiares conectados
POST   /api/family                    # Enviar convite
DELETE /api/family/:id                # Remover conexão
PATCH  /api/family/:id                # Atualizar permissões
Convites
GET    /api/family/invites            # Listar convites pendentes
POST   /api/family/invites/:id/accept # Aceitar convite
POST   /api/family/invites/:id/reject # Rejeitar convite
Medicamentos
GET    /api/family/:familyId/medications   # Medicamentos do familiar
GET    /api/medications                    # Medicamentos próprios
POST   /api/medications                    # Criar medicamento
PUT    /api/medications/:id                # Atualizar medicamento
DELETE /api/medications/:id                # Deletar medicamento
Logs e Estatísticas
GET    /api/family/:familyId/logs     # Histórico do familiar
GET    /api/family/:familyId/stats    # Estatísticas do familiar
POST   /api/logs                      # Registrar medicamento tomado

Equipe
Tony Cleriston
João Arthur Mascarenhas
Vinicius Cerqueira
Gabriel Arlisson
