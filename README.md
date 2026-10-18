# LOGOS — Central de Resposta a Incidentes

MVP full-stack focado em ingestão, triagem ágil e visualização de incidentes rodoviários em tempo real.

---

## Links

* **Front-end em Produção:** [Acessar Aplicação Web](https://logos-mvp-rho.vercel.app/)
* **Documentação da API (Swagger):** [Acessar Swagger UI](https://logos-mvp.onrender.com/docs)
* **Vídeo de Demonstração Técnica:** [Assistir Vídeo no Drive](https://drive.google.com/file/d/1xTwTyMXCIdXqM1eaY81UI9L4Bpn2CAAF/view?usp=drive_link)
* **Repositório GitHub:** [github.com/CauanHalison/logos-mvp](https://github.com/CauanHalison/logos-mvp)

> ⚠️ **Aviso sobre o primeiro acesso (Cold Start):** A API está hospedada na camada gratuita do Render. Caso o serviço esteja inativo há algum tempo, a primeira requisição pode levar cerca de **40 a 60 segundos** para inicializar o contêiner. Após a primeira inicialização, a navegação volta à sua performance instantânea habitual.

---

## Apresentação de incidentes

> **Como o analista identifica o que é prioridade em milissegundos?**

1. **Hierarquia Visual e Código de Cores NOC/SOC:** Ocorrências com criticidade **Crítica** possuem badge vermelho de alto contraste com animação de pulso contínuo (*glow*), capturando a atenção visual imediata do operador.
2. **Ordenação Inteligente no Backend:** A API serve os incidentes priorizando criticidade e recência, garantindo que emergências apareçam no topo imediato da visualização.
3. **KPIs Consolidados em Tempo Real:** Cards no topo da tela resumem instantaneamente o total de ocorrências, incidentes críticos, em investigação e resolvidos.
4. **Filtros Ágeis e Sincronização via URL:** Filtros combinados (placa, status, criticidade, categoria) refletem em `URLSearchParams`, viabilizando compartilhamento direto de buscas e paginação sem perda de estado.

---

## Arquitetura e Escolhas Tecnológicas

### Backend (Python / FastAPI)
* **FastAPI:** Escolhido pela alta performance assíncrona, baixo overhead e geração nativa de OpenAPI/Swagger.
* **Pydantic v2:** Validação robusta de esquemas e sanitização de dados, com mensagens de erro traduzidas para o português.
* **SQLAlchemy 2.0:** ORM moderno com tipagem estrita; opera com SQLite local para inicialização zero-config e compatibilidade total com PostgreSQL.
* **Segurança & Regras de Negócio:**
  * **JWT + Bcrypt:** Autenticação segura via Bearer Token e hashing de senhas.
  * **E-mails Case-Insensitive:** Validação e indexação (`NOCASE`) impedem duplicidade de contas com variações de maiúsculas/minúsculas.
  * **Bloqueio operacional:** Ao assumir um incidente (`Em Investigação`), o operador torna-se responsável exclusivo. Modificações por outros operadores são rejeitadas com **`403 Forbidden`**.

### Frontend (React / TypeScript / Vite)
* **React 19 + TypeScript:** Tipagem estrita de contratos de API e hooks desacoplados (`useIncidents`, `useAuth`, `useToast`).
* **Vite:** Ferramenta de build ultrarrápida e modular.
* **React Router DOM v7:** Gerenciamento de rotas protegidas (redirecionamento automático ao login) e persistência de filtros na URL.
* **Axios com Interceptors:** Injeção automática de Bearer Token e captura centralizada de erros (401, 403, 404, 500) com feedback via Toasts.

---

## Como Executar Localmente

### Pré-requisitos
* **Python 3.10+** e **Node.js 18+**
* **Git**

---

### 1. Backend (API)

```bash
# 1. Acesse o diretório do backend
cd back

# 2. Crie e ative o ambiente virtual
# No Windows:
python -m venv .venv
.venv\Scripts\activate

# No Linux/Mac:
python3 -m venv .venv
source .venv/bin/activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure o .env (já preparado para SQLite local)
cp .env.example .env

# 5. Inicie a API
uvicorn app.main:app --reload --port 8000
```

* API disponível em: `http://127.0.0.1:8000`
* Documentação interativa Swagger: `http://127.0.0.1:8000/docs`

---

### 2. Frontend (Interface)

```bash
# 1. Acesse o diretório do frontend
cd front

# 2. Instale as dependências
npm install

# 3. Configure o .env
cp .env.example .env

# 4. Inicie o servidor Vite
npm run dev
```

* Aplicação disponível em: `http://localhost:5173` (ou porta informada no terminal).

---

## Credenciais de Acesso (Demonstração)

Você pode utilizar o operador de testes ou o botão **"Preencher dados de demonstração"** na tela de login:

* **E-mail:** `operador@autou.com.br`
* **Senha:** `senha_secreta_123`

*(Também é possível cadastrar novos operadores livremente na aba "Criar conta").*

---

## 📂 Estrutura de Pastas

```text
logos-mvp/
├── back/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Rotas de Auth, Incidents e Health
│   │   ├── core/              # Configurações Pydantic e JWT/Bcrypt
│   │   ├── db/                # Sessão SQLAlchemy e Base declarative
│   │   ├── models/            # Modelos ORM (User, Incident)
│   │   ├── schemas/           # Schemas Pydantic de entrada e saída
│   │   ├── services/          # Regras de negócio e controle de ownership
│   │   └── main.py            # Inicialização FastAPI, CORS e handlers
│   ├── requirements.txt       # Dependências Python
│   └── .env.example           # Modelo de variáveis de ambiente
│
├── front/
│   ├── src/
│   │   ├── components/        # Tabela, Filtros, Modais, KPIs, Toasts
│   │   ├── contexts/          # AuthContext e ToastContext
│   │   ├── hooks/             # useIncidents, useAuth, useToast
│   │   ├── pages/             # LoginPage e DashboardPage
│   │   ├── services/          # Cliente Axios e rotas da API
│   │   ├── types/             # Tipagens TypeScript
│   │   └── index.css          # Design System Dark NOC responsivo
│   ├── package.json           # Dependências e scripts npm
│   └── vite.config.ts         # Configurações do Vite
│
└── README.md                  # Documentação central do projeto
```

---

## Autor

**Cauan Halison Arantes de Oliveira**
