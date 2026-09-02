# FinanzasAI — Especificación técnica y reglas de implementación

Construye una aplicación web real llamada **FinanzasAI**, no una maqueta.

La aplicación será una plataforma multiusuario para gestión de finanzas personales, familiares y de equipos.

## Stack obligatorio

* Next.js
* TypeScript
* React
* Supabase

  * PostgreSQL
  * Supabase Auth
  * Row Level Security
  * Storage cuando sea necesario
  * Realtime cuando aporte valor
  * Edge Functions para lógica server-side sensible
  * la base de datos se sube en código para que supabase la implemente automáticamente mediante un push a GitHub que ya esta configurado
* Vercel para hosting/deployment
* Tailwind CSS
* Componentes UI modernos y accesibles
* Gemini API para funciones de IA

El sistema debe estar preparado para producción y debe evitar cualquier arquitectura provisional que posteriormente obligue a reescribir el núcleo financiero.

---

# PRINCIPIO ARQUITECTÓNICO FUNDAMENTAL

FinanzasAI debe funcionar como un **sistema financiero basado en un ledger centralizado**.

El ledger es la fuente de verdad de todas las operaciones financieras.

Ningún módulo podrá implementar su propia lógica aislada para modificar saldos, registrar gastos, ingresos o transferencias.

Todas las operaciones deben utilizar una única capa centralizada de lógica financiera.

Por ejemplo:

* Cuentas
* Movimientos
* Importación
* Tarjetas
* Recurrencias
* Recibos
* Transferencias
* Pagos
* Ajustes
* Funcionalidades futuras

deben utilizar los mismos servicios, validaciones, reglas de negocio y respuestas.

Si mañana se modifica una regla financiera, debe bastar con modificar la capa centralizada.

No duplicar lógica financiera entre componentes, páginas o endpoints.

---

# AUTENTICACIÓN

Utilizar Supabase Auth.

Implementar:

* registro
* login
* logout
* recuperación de contraseña
* gestión de sesión
* protección de rutas
* persistencia de sesión
* perfil editable

La aplicación debe impedir que un usuario autenticado pueda acceder a información financiera de otro usuario o workspace sin autorización.

---

# MULTIUSUARIO

Implementar el concepto de workspace.

Un usuario puede pertenecer a uno o varios workspaces.

Cada workspace puede ser:

* personal
* familiar
* equipo

Implementar miembros y roles:

* owner
* admin
* editor
* viewer

Diseñar permisos centralizados.

Nunca comprobar permisos de forma diferente en cada página.

Debe existir una capa centralizada:

```text
permissions/
```

que determine:

* quién puede leer
* quién puede crear
* quién puede modificar
* quién puede eliminar
* quién puede invitar usuarios
* quién puede administrar configuración

---

# SEGURIDAD

Todas las tablas que contengan información sensible deben utilizar Row Level Security.

La autorización debe apoyarse en Supabase Auth + RLS.

Nunca confiar únicamente en comprobaciones realizadas en React.

La seguridad real debe existir en backend/database.

Nunca exponer:

* service role key
* secretos
* claves API privadas
* tokens de terceros
* contraseñas

en el navegador.

---

# GEMINI

Implementar integración con Gemini mediante backend/server-side.

El usuario podrá introducir su propia Gemini API Key.

La API Key:

* nunca debe enviarse al navegador después de guardarse
* nunca debe aparecer en logs
* nunca debe aparecer en respuestas API
* nunca debe almacenarse en texto plano
* nunca debe incluirse en código frontend

Implementar almacenamiento cifrado de la clave.

La clave debe ser descifrada únicamente en server-side cuando sea necesario llamar a Gemini.

La clave de cifrado debe estar almacenada como secreto de servidor y nunca en la base de datos.

Crear un servicio centralizado:

```text
AIService
```

con funciones como:

```text
chat()
categorizeTransaction()
generateMonthlySummary()
generateAnnualSummary()
analyzeFinances()
```

El resto de la aplicación nunca debe llamar directamente a Gemini.

---

# PRIVACIDAD DE IA

Enviar a Gemini solamente el contexto necesario para realizar cada operación.

Nunca enviar innecesariamente:

* contraseña
* email
* teléfono
* token
* información de autenticación
* datos personales irrelevantes

El contexto financiero debe ser anonimizado/minimizado siempre que sea posible.

---

# MODELO FINANCIERO

Crear un modelo basado en:

## Workspaces

```text
id
name
type
created_by
created_at
updated_at
```

## Workspace Members

```text
id
workspace_id
user_id
role
created_at
```

## Accounts

Representan cuentas financieras reales.

Tipos:

* bank
* cash
* credit_card
* loan
* savings
* investment
* other

Campos mínimos:

```text
id
workspace_id
name
type
institution
currency
opening_balance
credit_limit
is_active
created_at
updated_at
```

No utilizar floating point para importes monetarios.

Utilizar numeric/decimal adecuado en PostgreSQL.

---

# LEDGER

Crear:

```text
ledger_transactions
ledger_entries
```

Cada operación financiera deberá poder representar:

* ingreso
* gasto
* transferencia
* devolución
* ajuste
* pago de tarjeta
* otro

Una transacción puede tener múltiples entries.

Ejemplo de transferencia:

Cuenta A:

```text
-500
```

Cuenta B:

```text
+500
```

Ambas pertenecen a la misma transacción.

No crear una transferencia como dos movimientos independientes sin relación.

---

# CAMPOS DE TRANSACCIÓN

Una transacción debe soportar como mínimo:

```text
id
workspace_id
type
status
transaction_date
description
merchant
category_id
created_by
created_at
updated_at
```

Cada entry:

```text
id
transaction_id
account_id
amount
currency
direction
```

Añadir trazabilidad suficiente para saber:

* quién creó la operación
* cuándo
* quién la modificó
* cuándo
* origen de importación si corresponde
* si fue creada manualmente
* si fue generada por recurrencia
* si fue confirmada después de una importación

---

# CATEGORÍAS

Crear categorías personalizables por workspace.

Ejemplos:

* alimentación
* vivienda
* transporte
* ocio
* salud
* educación
* salario
* inversiones
* impuestos
* otros

Permitir subcategorías.

La categorización IA debe poder sugerir categoría sin modificar automáticamente un movimiento confirmado.

---

# ESTADOS DE MOVIMIENTO

Soportar como mínimo:

```text
pending
confirmed
cancelled
```

Los movimientos importados o generados por IA pueden quedar inicialmente como:

```text
pending
```

El usuario debe poder revisarlos y aprobarlos manualmente.

---

# IMPORTACIÓN

Crear módulo independiente de importación.

Soportar:

* texto
* CSV
* documentos cuando técnicamente sea viable

Pipeline:

```text
upload/input
    ↓
parse
    ↓
normalize
    ↓
validate
    ↓
detect duplicates
    ↓
AI categorization
    ↓
preview
    ↓
manual confirmation
    ↓
ledger
```

Nunca insertar directamente datos no validados en el ledger.

El usuario debe ver una vista previa antes de confirmar.

Permitir:

* cambiar cuenta
* cambiar categoría
* cambiar importe
* cambiar descripción
* cambiar fecha
* aceptar
* rechazar

---

# DUPLICADOS

Implementar detección de movimientos potencialmente duplicados.

Utilizar información como:

* cuenta
* fecha
* importe
* descripción
* identificador externo si existe

No eliminar automáticamente movimientos sospechosos.

Marcarlos como posibles duplicados y permitir revisión.

---

# CUENTAS

Página independiente.

Debe permitir:

* crear
* editar
* activar/desactivar
* eliminar cuando sea seguro
* visualizar saldo
* visualizar movimientos
* filtrar
* buscar

El saldo mostrado debe proceder del ledger y no de un valor duplicado calculado manualmente y almacenado sin control.

---

# TARJETAS

Las tarjetas pueden modelarse como cuentas financieras especializadas.

Implementar:

* límite de crédito
* crédito utilizado
* crédito disponible
* pagos
* movimientos
* fecha de cierre
* fecha de vencimiento cuando corresponda

---

# PRÉSTAMOS

Implementar soporte inicial para:

* principal
* saldo pendiente
* tasa
* cuota
* frecuencia
* fecha de inicio
* fecha de vencimiento

La estructura debe permitir ampliar el módulo posteriormente.

---

# RECURRENTES

Crear módulo independiente.

Permitir crear reglas recurrentes:

* importe
* cuenta
* categoría
* descripción
* frecuencia
* fecha próxima
* fecha final opcional

Las recurrencias no deben duplicar lógica del ledger.

Deben utilizar el servicio financiero central.

---

# PRESUPUESTOS

Permitir crear presupuestos:

* por categoría
* por mes
* por workspace

Mostrar:

```text
presupuesto
gastado
restante
porcentaje utilizado
```

Todos los cálculos deben proceder de movimientos confirmados.

---

# DASHBOARD

Crear dashboard profesional.

Por defecto resumenes anuales, Debe incluir selector de mes.

Todos los KPIs deben responder al mes seleccionado o en su defecto al año.

Mostrar:

* ingresos
* gastos
* balance
* ahorro
* patrimonio neto
* evolución
* categorías principales
* cuentas
* comparativa con mes anterior

La comparación mensual debe utilizar exactamente las mismas reglas financieras que el resto de la aplicación.

No duplicar consultas o cálculos con reglas diferentes.

---

# PATRIMONIO NETO

Calcular como:

```text
activos - pasivos
```

Los activos y pasivos deben proceder de las cuentas correspondientes.

No calcular patrimonio a partir exclusivamente de ingresos y gastos.

---

# CHAT IA

Crear página independiente de chat.

Debe permitir:

* conversación con Gemini
* contexto financiero del workspace
* preguntas sobre gastos
* análisis de tendencias
* recomendaciones generales
* explicación de movimientos
* consultas mensuales

La IA debe distinguir entre:

* datos reales procedentes de la base de datos
* interpretación
* recomendaciones

Nunca inventar datos financieros.

---

# RESUMEN MENSUAL IA

Crear resumen inteligente del mes.

Debe incluir:

* ingresos
* gastos
* variaciones
* principales categorías
* movimientos destacados
* ahorro
* anomalías
* comparación con mes anterior

El resumen debe generarse utilizando datos reales del ledger.

---

# RESUMEN ANUAL IA

Misma lógica para todo el año.

Nunca inventar cifras.

---

# NOTIFICACIONES

Implementar sistema de notificaciones.

Soportar inicialmente:

* presupuesto próximo a límite
* presupuesto excedido
* recibo próximo
* movimiento pendiente
* importación completada
* invitación a workspace

---

# PERFIL

Permitir editar:

* nombre
* avatar
* preferencias

No almacenar innecesariamente datos personales.

---

# UI/UX

Interfaz moderna, profesional y limpia.

Inspiración general:

* fintech modernas
* dashboards financieros
* aplicaciones bancarias contemporáneas

No copiar diseños concretos ni mencionar marcas.

Priorizar:

* claridad
* legibilidad
* jerarquía visual
* responsive
* accesibilidad

El sidebar debe quedar fijo mientras el contenido principal hace scroll.

---

# RUTAS

Crear páginas reales e independientes:

```text
/login
/register
/dashboard
/accounts
/accounts/[id]
/transactions
/cards
/loans
/budgets
/recurring
/import
/members
/reports
/notifications
/settings/profile
/settings/ai
/ai
```

No crear botones falsos.

Todos los botones deben realizar acciones reales o navegar a páginas reales.

---

# API Y SERVICIOS

Crear servicios centralizados.

Ejemplo conceptual:

```text
FinancialService
AccountService
TransactionService
TransferService
BudgetService
RecurringService
ImportService
WorkspaceService
PermissionService
AIService
NotificationService
```

Nunca colocar reglas financieras complejas directamente dentro de componentes React.

---

# BASE DE DATOS

Utilizar migraciones de Supabase.

No crear tablas manualmente desde la aplicación.

Toda modificación de esquema debe quedar representada mediante migration.

Crear índices adecuados.

Crear foreign keys.

Utilizar constraints para mantener integridad.

Crear políticas RLS para todas las tablas sensibles.

---

# VALIDACIÓN

Utilizar validación compartida.

Validar:

* importes
* monedas
* fechas
* relaciones
* permisos
* estados
* workspace ownership/membership

Los datos deben validarse tanto en frontend como backend.

La validación de backend siempre es la autoridad.

---

# MANEJO DE ERRORES

Crear respuestas consistentes.

No devolver errores internos ni secretos al cliente.

Registrar errores server-side sin almacenar información sensible innecesaria.

---

# TESTS

Crear pruebas para el núcleo financiero.

Como mínimo comprobar:

1. crear ingreso
2. crear gasto
3. transferencia entre cuentas
4. cálculo de saldo
5. cálculo de patrimonio
6. comparación mensual
7. permisos por workspace
8. RLS
9. duplicados de importación
10. confirmación de movimientos
11. categorización IA
12. acceso seguro al token Gemini

---

# REGLA CRÍTICA DE IMPLEMENTACIÓN

Antes de crear funcionalidades secundarias, construir y estabilizar:

1. Auth
2. Workspaces
3. Members/Roles
4. Database schema
5. RLS
6. FinancialService
7. Ledger
8. Accounts
9. Transactions
10. Dashboard

Después implementar:

* tarjetas
* presupuestos
* recurrentes
* importación
* IA
* notificaciones
* informes

No crear una falsa interfaz mientras el backend todavía no existe.

Cada módulo terminado debe conectarse a datos reales.

No utilizar arrays hardcodeados como sustituto de la base de datos.

No crear botones que únicamente muestren toast de "próximamente".

No considerar una funcionalidad terminada hasta que pueda:

```text
crear → persistir → recuperar → modificar → validar → reflejarse en dashboard
```

y, cuando corresponda:

```text
crear → ledger → saldo → dashboard → informes → IA
```

El objetivo es construir una aplicación financiera funcional y extensible, no una demostración visual.
