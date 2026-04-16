# Approach Notes

This document summarizes how the project was improved iteratively, what problems were identified, how the final solution evolved, and the tradeoffs involved.

## Goals

The main requested feature was:

- delete a shape from the shape tree using a button next to each tree item

The main bonus feature was:

- show each shape's geometry type and color in the tree

Beyond that, the codebase had several intentional design flaws around correctness, state flow, subscriptions, and scalability.

## Iterative Approach

The work was approached in this order:

1. fix correctness issues first
2. make sure the requested feature and bonus behavior work end to end
3. add tests around the important user flows
4. improve maintainability and state flow
5. improve rendering and UI polish

This order was intentional. The goal was to stabilize behavior before doing larger refactors or visual changes.

## Problems, Iteration, and Scalability

### 1. Tree deletion, stale selection, and misleading labels

The first group of issues was around correctness in the tree itself.

Problems:

- the requested delete button was missing from the tree UI
- deleting a parent subtree could leave selection pointing at a deleted child
- labels were derived from array position, so remaining siblings could appear to be renumbered after deletion

The solution was implemented iteratively:

1. add a delete button next to each tree item
2. fix event propagation so delete clicks do not trigger unintended selection
3. clear selection when the selected shape is inside the deleted subtree
4. switch numbering to stable display numbers instead of position-based relabeling
5. refactor the tree into smaller focused components so deletion logic and nested rendering were easier to reason about (structural detail covered in section 4)
6. add tests for deleting children, deleting parent subtrees, and clearing stale selection

Complexity impact:

- before: correctness bugs caused follow-up actions to work against invalid state, which made behavior unreliable even when raw runtime cost looked small
- after: deletion and selection still operate on the affected subtree, but they now do so against a consistent state model instead of stale references

### 2. Shape count and state reads were too tied to scene traversal

The original count logic did not reliably match the visible shapes, and it was derived by traversing the Three.js scene graph.

That meant:

- app logic depended directly on the render layer
- the count required walking scene nodes repeatedly
- a frequently-read UI value depended on `scene.traverse(...)`

The solution was:

1. stop treating the scene graph as the main app-state source
2. introduce normalized shape state in `ShapeProvider`
3. track `shapesById`, `meshById`, `rootShapeIds`, and `selectedShapeId`
4. update `shapeCount` incrementally as shapes are added or removed

Big O:

- before: count reads depended on a full traversal, which is `O(n)` for `n` scene nodes
- after: count reads are `O(1)` because the provider stores the count directly

Scalability impact:

- at 1,000 shapes this is meaningfully better because common reads are no longer tied to repeated full-scene traversal
- at 10,000 shapes this matters even more because the count remains cheap even as scene size grows

### 3. React subscriptions and state ownership were too broad

The original structure had React components subscribing in render paths, and different parts of the app were mounted separately. The tree was also too dependent on live Three.js objects.

That created several problems:

- duplicate listeners could accumulate
- shared app state was awkward because the UI was split across separate roots
- the tree depended too directly on `Mesh` instances and `mesh.children`
- UI code was harder to test because it relied on render-layer objects

The solution was implemented in stages:

1. move the app under a single React root
2. introduce `ShapeProvider` as the source of truth
3. move create/delete/select actions into the provider
4. route canvas selection through the provider-owned flow as well
5. keep Three.js as the rendering layer instead of the main UI state model
6. remove the legacy `MainViewController` and notification-center path once the provider-owned flow was fully in place
7. add a small `GlobalShortcuts` component inside the React tree so keyboard actions stay with the provider-owned app flow

Big O and scalability impact:

- this change was less about one dramatic complexity drop and more about making state access predictable
- indexed lookups such as `shapesById.get(id)` and `meshById.get(id)` are effectively `O(1)`
- hierarchy reads now come from `rootShapeIds`, `parentId`, and `childIds` rather than from ad hoc scene traversal

This was also the key decoupling step:

- before: the UI depended much more directly on live Three.js objects and scene traversal
- after: the UI reads a normalized indexed state model, while Three.js stays as the rendering and interaction layer behind that model

At 1,000 shapes, the practical difference is that any lookup, finding a shape by id, reading its children, checking its parent is now a single map read instead of a scene traversal. The UI never has to walk Three.js nodes to answer a data question.

At 10,000 shapes, this architecture does not eliminate every cost, rendering a large scene and a large tree are still inherently expensive, but the expensive parts are now isolated to the rendering layer where they belong. App logic and UI queries stay cheap regardless of scene size, because they never touch the scene graph at all.

### 4. Tree rerender scope and nested-tree usability

The tree UI had both usability/design issues and scaling issues.

Problems:

- nested rows shifted the whole interactive row instead of only indenting inner content
- long labels could truncate awkwardly
- guide lines and selection styling needed refinement
- scene-driven selection and tree-driven selection did not fully help the user navigate between the two views

The solution was iterative:

1. keep the interactive row full width and indent only the inner content
2. improve nested tree visuals, guide lines, truncation, focus, and tooltip behavior
3. split the tree into smaller focused pieces such as item, node, empty-state, and accordion-driven nested rendering
4. move tree context reads upward into `ShapeTree`
5. pass row-specific props down to `ShapeTreeNode`
6. remove direct broad context consumption from each row, then simplify the row implementation again once memoization did not show a strong payoff in profiling/debugging
7. auto-expand the selected branch and scroll the selected row into view when selection comes from the scene

The bidirectional navigation UX (clicking a tree node focuses the camera on that shape, and clicking a shape in the scene opens its branch and scrolls it into view) is covered in detail in section 5, since it was introduced alongside the scene rendering improvements.

Big O and scalability impact:

Context on "before": the original code did not use a React context at all. `ShapeList` subscribed to a notification center and `ShapeNode` rows received props from it, so N rows did not mean N subscriptions in the original starting point. The N-subscription issue was an intermediate state that was introduced when `ShapeProvider` was added and rows initially called `useShapeState()` directly, before reads were lifted upward.

- before (intermediate state after provider was introduced): every row called `useShapeState()` directly, so N rows meant N context subscriptions and any state change triggered N re-render checks
- after: only `ShapeTree` subscribes to context; rows receive props, reducing subscriptions to 1

Scalability outlook:

- at 1,000 shapes, the main gain is one context subscription instead of 1,000; visible row re-renders on each state change are still proportional to what is expanded in the tree
- at 10,000 shapes, the remaining pressure is the cost of rendering a very large nested DOM tree; the right solution there is list virtualization so only visible rows are rendered at all, regardless of total shape count

### 5. Rendering quality

The scene originally used unlit materials, so shapes looked flat and harder to read.

The solution was straightforward:

1. improve scene lighting
2. switch to shaded materials
3. reuse shared geometry by shape type and shared materials by color when creating meshes
4. move the scene to render-on-demand instead of running a continuous render loop when nothing changed

This started as a readability improvement, and later became a more explicit rendering-efficiency improvement as shape count grew.

The scene interaction flow was also improved so selection now works as navigation:

1. selecting from either the tree or the scene focuses the camera on the chosen shape — both `selectShape` and `selectShapeFromCanvas` call `engine.focusObject`, so neither input leaves the user staring at an empty viewport
2. selecting from the scene reveals the matching tree row by opening the selected branch and scrolling it into view
3. selecting from the tree highlights the corresponding shape and expands the branch
4. reset view was added so camera focus is useful without trapping the user in a zoomed-in state

Scalability impact:

- before: creating many shapes also created many duplicate geometry and material objects
- before: the scene also rendered continuously even when nothing in the viewport had changed
- after: each new shape still creates a new `Mesh`, but it reuses the existing geometry for its type and the existing material for its color
- after: the scene only requests a redraw when selection, resize, controls, or scene contents actually change
- at 10,000 shapes this reduces unnecessary CPU, memory, and GPU-side object churn during shape creation, and it avoids wasting frames when the scene is idle

### 6. Sidebar usability and layout polish

Once the tree behavior was stable, the right sidebar still had a usability gap: it was fixed-width, which made deep hierarchies and longer labels harder to inspect comfortably.

The solution was:

1. introduce a resizable right sidebar wrapper
2. add a dedicated resize handle and local component styling
3. keep the tree inside the resizable panel so the user can trade canvas space for tree readability when needed

This was mainly a usability improvement rather than a complexity change, but it helps at larger hierarchy sizes because it gives the user more room to inspect nested rows and truncated labels without changing the data model.

### 7. Context split for targeted subscriptions

After the provider was stable, one remaining scalability issue was that every consumer called `useShapes()` and subscribed to the entire context value. Any mutation — adding a shape, deleting a shape, changing selection — caused the whole context object to change, which triggered a re-render in every consuming component regardless of what it actually used.

Problems:

- `Toolbar` only needs `resetView`, which never changes, but re-rendered on every shape mutation
- `ShapePanel` only needs `createShape`, but re-rendered on every selection change
- `SceneCanvas` only needs `selectShapeFromCanvas`, but re-rendered on every shape add or delete
- `CountComponent` only needs `shapeCount`, but was bundled with the same context as the stable callbacks

The solution was to split `ShapeContext` into two separate contexts:

1. `ShapeStateContext` — reactive values that change with mutations: `shapeCount`, `rootShapeIds`, `selectedShapeId`, `getShapeById`
2. `ShapeActionsContext` — stable callbacks: `createShape`, `deleteShape`, `deleteSelectedShape`, `selectShape`, `selectShapeFromCanvas`, `resetView`

Each context gets its own `useMemo` with only its own dependencies, so a state change does not invalidate the actions context reference and vice versa.

Consumers were migrated to the specific hook they need:

- `ShapePanel`, `SceneCanvas`, `Toolbar`, `GlobalShortcuts` → `useShapeActions()`
- `CountComponent` → `useShapeState()`
- `ShapeTree` → both, since it reads state for display and actions for interaction

Tests render the full app through `initializeApp()` and interact via the DOM, so they do not need a combined hook. `useShapes()` was removed once it was no longer referenced.

Scalability impact:

- before: every mutation caused a re-render fan-out across all consumers regardless of what they read
- after: state-only consumers re-render on mutations; action-only consumers only re-render when the callback deps themselves change, which is less frequent
- at 1,000 shapes this noticeably reduces render work for components like `Toolbar` and `ShapePanel` that have no reason to update on each shape add or delete
- at 10,000 shapes this matters more because the mutation rate is higher and the savings per mutation compound

### 8. Dark and light mode via ThemeProvider

After the core behavior was stable, the app only supported a single hardcoded dark theme. Colors were scattered across multiple CSS files and the Three.js engine with no shared source.

Problems:

- panel, toolbar, tree, and scene colors were hardcoded in several places
- adding a light theme would have required editing styles one file at a time
- the 3D scene background, lights, and grid had no connection to any UI-level theme state

The solution:

1. introduce a `ThemeProvider` that reads from `localStorage` and exposes a `useTheme` hook with `theme` and `toggleTheme`
2. reflect the active theme on `document.documentElement.dataset.theme` so CSS variables switch automatically
3. define a `SCENE_THEMES` map in `engine.ts` with per-theme values for background, grid, hemisphere light, and fill light
4. add an `applyTheme(theme)` method to `ThreeEngineController` that updates the scene and triggers a render
5. call `applyTheme` from `SceneCanvas` in a `useLayoutEffect` that re-runs whenever `theme` changes

Key implementation detail — grid color:

`GridHelper` bakes colors into the geometry's vertex color buffer at construction time using `vertexColors: true`. Setting `material.color` after the fact has no visible effect. The correct approach is to remove the old `GridHelper` from the scene and add a new one with the correct colors whenever the theme changes.

Key implementation detail — shape selection highlight:

The selection highlight uses a shared `MeshStandardMaterial` with a fixed color rather than per-shape emissive tinting. Emissive tinting gives inconsistent results because the same yellow emissive on a red shape looks orange, while on a blue shape it looks different again. A shared material ensures every selected shape looks identical regardless of its original color, and `MeshStandardMaterial` still responds to scene lighting so shapes do not look flat when selected.

Tradeoff:

- rebuilding the `GridHelper` on each theme switch is more work than an in-place update, but it is the only correct approach given how Three.js bakes vertex colors at construction time
- a shared highlight material keeps selection visually consistent and avoids per-shape clone allocations on every selection change
- this does not change algorithmic complexity, but it reduces styling fragility by centralizing all color decisions into a single token layer

### 9. Overall 1,000 vs 10,000 shape outlook

At around 1,000 shapes, the current architecture should behave much better than the starting point because:

- count reads are `O(1)` instead of repeated `O(n)` traversal
- hierarchy and identity are indexed through normalized provider state
- context is split so action-only consumers do not re-render on state mutations
- deletion and selection behavior are more consistent and easier to reason about

At around 10,000 shapes, the app would still likely begin to feel pressure, but for different reasons than before:

- rendering a very large nested DOM tree is still expensive
- scene interaction still scales with the number of scene objects involved
- shape creation is now cheaper than before because geometry and material allocation are shared, but mesh count still grows linearly
- idle rendering is cheaper than before because the scene no longer redraws constantly
- large hierarchy changes still require real work, even with indexed state

So the main improvement is not that the app becomes magically cheap at 10,000 shapes. The improvement is that the expensive parts are now more intentional and localized, instead of being mixed together with correctness bugs, repeated traversal, and overly broad subscriptions.

## UI Improvements

After correctness and state flow were stabilized, the UI was improved to make the app easier to understand:

- redesigned top toolbar with inline project name editing
- improved add-shape panel layout
- improved shape tree layout and hover/selection affordances
- added geometry type and color indicators directly in the tree rows
- added accordion support for nested shapes
- improved tree scrolling behavior so nesting does not create awkward overflow behavior
- added a tooltip for truncated tree labels so deeply nested items still expose their full name
- added lighting and shaded materials to improve scene readability
- synchronized scene selection with tree navigation and added reset-view behavior

Tradeoff:

- UI polish was done last, after correctness and architecture were stable. Polishing a broken or poorly-structured UI just means redoing that work later
- the goal was a cleaner and more usable interface, not a full visual redesign

## Final State

The final solution is intentionally iterative rather than a complete rewrite.

What it achieves:

- requested feature implemented
- bonus feature implemented
- tests added for the main flows
- app state moved into a dedicated provider
- single React tree instead of fragmented UI mounting
- keyboard shortcuts handled inside the React tree through a small `GlobalShortcuts` component
- legacy notification/controller state flow removed from the active app path
- indexed shape state now sits between the UI and the Three.js scene
- context split into `ShapeStateContext` and `ShapeActionsContext` so consumers only re-render when the slice they read actually changes
- resizable right sidebar added for better tree usability
- improved scene rendering, scene focus behavior, and tree usability

Why this approach was chosen:

- it improves the project in clear steps
- it keeps the changes explainable in git history
- it prioritizes reliability, maintainability, and scalability over unnecessary rewrite scope
