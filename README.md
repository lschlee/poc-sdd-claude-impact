# Próxima Visita — Fila de Prioridade para ACS

> POC desenvolvido para o **Claude Impact Lab** — demonstração de como IA pode apoiar decisões em saúde pública com dados 100% mockados.

No Brasil, cada ACS acompanha dezenas de famílias em sua micro-área. Decidir **quem visitar primeiro** costuma depender de memória, papel e intuição. Este aplicativo demonstra como seria uma fila ordenada por risco calculado — com os motivos explícitos para cada posição.

> **Atenção:** este repositório não contém dados reais. Todas as famílias, moradores, endereços e visitas são fictícios e foram gerados exclusivamente para fins de demonstração.

---

## O que faz

O ACS abre o app no início do turno e vê:

- **Lista ordenada** das famílias que precisam de visita hoje, da maior para a menor prioridade, com os principais fatores de risco de cada uma ("38 dias sem visita", "1 gestante", "idoso com hipertensão")
- **Mapa do bairro** com os mesmos pins sincronizados com a lista — útil para planejar o roteiro a pé
- **Registro de visita** direto no card da família; ao registrar, o score recalcula e a fila se reordena em tempo real

---

## Score de risco

Cada família recebe uma pontuação de 0 a 1 combinando quatro fatores:

| Fator | Peso |
|---|---|
| Tempo desde a última visita | 40% |
| Condições crônicas nos moradores | 25% |
| Grupos vulneráveis (bebês, gestantes, idosos) | 25% |
| Flag de retorno pendente | 10% |

Famílias nunca visitadas são tratadas como o máximo possível de tempo decorrido e ficam no topo da fila. O ACS sempre vê *por que* uma família está naquela posição — não só o número.

---

## Instalação e execução

**Pré-requisitos:** Node.js 20 LTS, pnpm 9.x

```bash
git clone https://github.com/lschlee/poc-sdd-claude-impact
cd poc-sdd-claude-impact
pnpm install
pnpm dev
# → http://localhost:3000
```

No WSL2, abra no navegador Windows com:
```bash
explorer.exe http://localhost:3000
```

---

## Testes

```bash
pnpm test          # Jest — unitários + integração
pnpm test:e2e      # Playwright E2E (sobe o servidor automaticamente)
pnpm test:all      # Tudo junto
```

---

## Arquitetura em uma frase

App Next.js 14 + TypeScript que roda **100% offline** — sem backend, sem API, sem sincronização. O roster de famílias é estático no bundle; as visitas são gravadas em IndexedDB no dispositivo do ACS.

```
roster.ts (dados mockados)
    → scoring.ts (fórmula de risco)
    → useVisitQueue hook
    → Página inicial: QueueList + QueueMap
    → /family/[id]: FamilyDetailClient + VisitForm
```

---

## Limitações conhecidas do POC

- **Identidade única**: um único CHA (`Maria das Graças / CHA-001`) está "assado" no build. Não há autenticação.
- **Dados em texto plano**: visitas e dados de saúde ficam em IndexedDB sem criptografia. Aceitável para POC em dispositivo dedicado; inaceitável para produção.
- **Roster imutável**: as famílias e moradores são definidos em `src/data/roster.ts`. Editar o roster exige um novo build.
- **Sem exportação in-app**: para recuperar dados de visita ao fim do piloto, use o DevTools do navegador → Application → IndexedDB → `nvp-db` → `visits`.

---

## Como foi construído

Este POC foi desenvolvido com **Specification-Driven Development (SDD)** usando [Claude Code](https://claude.ai/code) — cada história de usuário foi especificada em `specs/`, o plano de implementação gerado a partir da spec, e as tarefas executadas em ordem de dependência. Os artefatos em `specs/001-next-visit-priority/` documentam as decisões de arquitetura, o contrato de scoring e o schema de storage.

O objetivo secundário deste repositório é servir como **exemplo de impacto do SDD + Claude Code** em projetos de produto real.
