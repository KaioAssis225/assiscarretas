# AssisCarretas — Contexto de produto (para skills de design)

**Registro:** product (a interface SERVE a operação; não é marketing).

**O que é:** sistema interno de gestão de locação de carretas para uma
locadora em Assis/SP. Usuários: equipe de balcão (ATENDENTE), gestão
(GESTOR/ADMIN), pátio (VISTORIADOR) e consulta (VIEWER).

**Cenário físico:** balcão de loja com luz ambiente clara e monitor comum;
no pátio, celular ao sol (vistorias com câmera). Tema claro; alvos de toque
≥ 44px; mobile-first nas telas de pátio.

**Tom:** ferramenta de trabalho confiável e sóbria — familiaridade ganha de
surpresa. Datas/moeda no padrão brasileiro. Português do Brasil.

**Stack de UI:** React 19 + Tailwind 3 (paleta neutra slate + primária
`hsl(220 70% 35%)`), shadcn/ui planejado para os blocos de telas ricas.
Acessibilidade WCAG AA é requisito do projeto (doc 04/05).

**Estado atual (Bloco 3):** login, troca de senha obrigatória, layout com
navegação e dashboard placeholder. Telas de cadastros/agenda/locações
chegam nos Blocos 4–6.
