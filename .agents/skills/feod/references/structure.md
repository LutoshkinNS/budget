# FEOD — structure

## Where to put an entity

Entities move between layers (common → module and back) — expected.

Before creating or moving modules, use [module-boundaries.md](module-boundaries.md).
This map helps locate URLs, universal code and application infrastructure after their owners are clear.

```
Need availability without import?            → global (.d.ts, polyfill, shim only)
Bootstrap, config, router or layout?         → app
URL, route parameters or navigation?         → pages (compose public module interfaces)
Cohesive application capability/integration? → modules
Small universal entity without domain owner?  → common
Implementation detail of an existing module? → ordinary internal folder
Independent part useful to isolate?           → modules/<Name>/modules/<Sub>/
```

| Entity | Layer |
|--------|-------|
| Entry, router, layouts, integrations | app |
| 404, about | pages |
| URL + route composition | pages (module pages are optional when allowed by the profile) |
| Application capability, integration, complex utility | modules |
| Design system / UI library | modules |
| Small universal control, formatDate | common |
| vue-router.d.ts, polyfill | global |

## Base tree (SPA)

```
src/
  app/            entry, router, layouts/, config/, integrations/, ui/ (layout pieces), styles/, assets/
  pages/          index.vue, [id].vue, [...404].vue, (group)/, _pageName/ (private module)
  modules/
    FeatureName/
      components/ | ui/   composables/   api/   store/   types/
      pages/              optional module pages (profile decides)
      modules/            submodules (fractal)
      index.ts            public API
  common/         ui/ (primitives), composables/, utilities/, types/, constants/
  globals/        vue-router.d.ts (name set by layerDirs.global)
```

Layer names come from the profile. Top-level `pages/` is optional. FEOD does not
prescribe module internals — only `index.ts` and optionally `modules/`, `pages/`.

Other frameworks: same layers; rename `composables/` → `hooks/`, `.vue` → `.tsx`, etc.
Meta-frameworks that fix their own routing directory (Next, Nuxt) keep it as the
**app/pages entry point** and delegate to `modules/` — see the profile. Top-level pages compose
public module interfaces; a page rendering one module can be a complete route composition.

## Variant trees

Commonless: no `common/`. Common-module: `modules/common/index.ts`.
Multiapp:

```
src/
  apps/{web,admin}/
  modules/   common/   pages/   (shared)
```

## File-based routing (convention, not required)

| URL | File |
|-----|------|
| `/` | `pages/index.vue` |
| `/about` | `pages/about.vue` |
| `/products/` | `pages/products/index.vue` |
| `/posts/123` | `pages/posts/[id].vue` |
| `/posts/1_2` | `pages/posts/[userId]_[postId].vue` |
| `/docs/a/b/c` | `pages/docs/[...path].vue` |
| named views | `pages/login.form.vue`, `pages/login.content.vue` |
| group w/o URL | `pages/(group)/` |

A manual router in app is equally valid.

## Extensions

SSR — split client/server entry: `app/entry.client.ts` + `app/server/entry.server.ts`
(or a separate server layer, see `docs/base/extensions.md`). Ready-made SSR
frameworks need not follow this.

DDD inside a module:

```
ModuleName/
  domain/entities/
  adapters/        primary: UI; secondary: API/repos
  index.ts
```

## Migrating to FEOD

1. Carve out `app/` — entry, router, config
2. Pages → `pages/` or `modules/*/pages/`
3. Features → `modules/<Feature>/` with `index.ts`
4. Shared utilities → `common/`
5. Global types/shim → `globals/`
6. Fix imports to match the matrix
7. Add feod config and the lint plugin ([lint.md](lint.md)); adopt gradually via `docs/linting/migration.md`
