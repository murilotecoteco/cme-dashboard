# Solar CME Monitor

Projeto prático para estudar consumo de dados científicos, visualização e persistência de eventos de ejeção de massa coronal (CME) da API NASA DONKI.

[![CI](https://github.com/murilotecoteco/cme-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/murilotecoteco/cme-dashboard/actions/workflows/ci.yml)

[Live Demo](https://solar-cme-monitor.vercel.app/) · [Código-fonte](https://github.com/murilotecoteco/cme-dashboard)

## Resultado

- Consulta de eventos solares pela API DONKI.
- Histórico persistido no Supabase/PostgreSQL.
- Gráficos e estatísticas por evento.
- Interface responsiva publicada na Vercel.
- Testes automatizados com Vitest e Testing Library.

## Onde cada linguagem é usada

- **JavaScript + JSX:** frontend React executado no navegador, incluindo componentes, estado, chamadas ao Supabase e visualizações.
- **TypeScript:** Edge Function Deno em `supabase/functions/donki-proxy/index.ts`, usada como proxy para proteger a chave da NASA.
- **SQL:** schema e consultas do banco Supabase/PostgreSQL.

A separação é intencional: o frontend atual usa JavaScript/JSX, enquanto a função serverless usa TypeScript.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | React, Vite, JavaScript e JSX |
| Visualização | Recharts |
| Backend/Banco | Supabase e PostgreSQL |
| Proxy | Deno Edge Function e TypeScript |
| Testes | Vitest, Testing Library e jsdom |
| Deploy | Vercel |

## Como executar

```bash
git clone https://github.com/murilotecoteco/cme-dashboard.git
cd cme-dashboard
npm install
npm run dev
```

Comandos úteis:

```bash
npm run lint
npm run test
npm run build
```

## Limitações

- O projeto depende da disponibilidade e dos limites da API NASA DONKI.
- A chave da NASA deve permanecer apenas no ambiente da Edge Function.
- O projeto é educacional e de portfólio; não substitui uma plataforma científica de produção.

## Licença

Projeto educacional e de portfólio.
