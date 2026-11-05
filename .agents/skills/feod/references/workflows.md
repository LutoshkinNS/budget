# FEOD — workflows

## Add a module

1. Read [module-boundaries.md](module-boundaries.md). Start with the project's large cohesive capabilities, then inspect their dependencies and internal scenarios before choosing a boundary.
2. Reuse or extend an existing module when it already owns the responsibility. Choose a new module when it has a clear purpose, owns related decisions or state, and presents a useful public interface.
3. Keep forms, lists and other implementation details in ordinary internal folders. Extract a submodule when a coherent internal capability benefits from an interface and isolation; promote it to a top-level module when the application consumes it as an independent capability.
4. Create `src/modules/<PascalCase>/`; internals follow the domain. Export **only what is needed** from `index.ts`; internal files are never imported from outside. Keep nesting shallow unless further isolation earns its complexity.
5. Use IoC to manage cross-module dependencies and prevent strong, reciprocal or upward coupling. Define the contract at the consumer and choose the implementation at the composition point.
6. Document the module: `README.md` (purpose, public API, example), optionally owners.
7. Unit tests live inside the module; multi-module integration tests in `app` (or the parent module).

```ts
// index.ts template
export { useFeature } from './composables/useFeature'
export { default as FeatureList } from './components/FeatureList.vue'
export type { Feature, CreateFeatureDto } from './types/feature.types'
```

## Add a page

1. Put the page in `src/pages/` according to the project profile and route convention in [structure.md](structure.md).
2. Keep the page as route-level composition: adapt URL parameters and navigation and connect public module interfaces. A page may render one module when that is the complete composition for its route.
3. Keep scenario rules and domain state in the module that owns that behavior; pass route values and page actions through the page interface.
4. Register in `app/router.ts` unless routing is automatic.
5. Route names live in `common/constants/routes.ts`.

## New project

```
- [ ] 1. Run init.md (or accept base defaults) → feod.profile.md
- [ ] 2. Create src/ layers per the profile
- [ ] 3. Alias @ → src in bundler and tsconfig paths
- [ ] 4. app/entry.ts, app/router.ts
- [ ] 5. Wire the ESLint/Oxlint plugin (lint.md); feod config only if the installed version reads it
- [ ] 6. Split features into modules; pages stay thin; shared bits go to common
```

Vite alias: `resolve.alias['@'] = fileURLToPath(new URL('./src', import.meta.url))`.

## Checklist before finishing

- [ ] Imports follow the layer matrix and the profile
- [ ] Modules export only through `index.ts`
- [ ] Pages compose module interfaces and own route concerns; modules own their behavior
- [ ] Common has no barrel (unless the profile allows it); entities are usually one file
- [ ] Global only for shim/polyfill/global types
- [ ] App has no business logic
- [ ] Profile and supported lint configuration agree
- [ ] Requested ESLint/Oxlint integration covers the intended source files
- [ ] Relevant lint checks pass; rule fixes have a regression reproducer
