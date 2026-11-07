# Nested modules

Use this directory when Принятие приглашения grows an internal capability with its own public API.

Good candidates:

- list/detail/editor/filter/sheet workflows;
- reusable sub-features that still belong to Принятие приглашения;
- UI plus model code that would make the root module hard to scan.

Keep route/search/navigation state in pages or route adapters, not in nested modules.
