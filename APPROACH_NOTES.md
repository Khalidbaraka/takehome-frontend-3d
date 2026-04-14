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

## Problems Identified

### 1. Tree deletion was missing

The core feature from the README was not implemented in the tree UI. Shapes could be deleted through other paths, but not from a delete button next to each tree item.

### 2. Shape count was incorrect

The count logic did not reliably match the actual number of shape meshes visible in the scene.

There was also a design problem in how count was computed:

- count was derived by traversing the Three.js scene graph
- that tightly coupled app logic to the rendering layer
- each count calculation required walking all scene nodes

From a runtime point of view, a full `scene.traverse(...)` is `O(n)` where `n` is the total number of nodes in the scene graph. That is not inherently quadratic for one traversal, but it is still a poor fit for a value that the UI reads often.

### 3. Selection state became stale after deletion

Deleting a shape or deleting a parent subtree could leave selection pointing at removed objects, which caused follow-up actions to behave incorrectly.

### 4. UI labels were misleading

The shape titles used display numbering in ways that could become confusing after deletion. In particular, numbering behavior needed to be clarified between root items and children.

### 5. Notification subscriptions were placed in render paths

Parts of the React UI subscribed to events during render rather than inside a lifecycle-managed effect. That risked duplicate listeners and unnecessary updates.

### 6. The UI depended too directly on live Three.js objects

The tree was being driven from `Mesh` objects directly. That worked for a small demo, but it made state management, testing, and scalability harder.

### 7. Rendering quality was flat

The scene used unlit materials, so shapes looked flat and visually undefined.

### 8. Tree usability degraded with nesting

Nested content made the tree feel noisy, and layout/overflow behavior could lead to poor scrolling and interaction.

## How The Solution Evolved

### Phase 1: Correctness and missing feature

The first step was to implement tree deletion and make it reliable.

Changes:

- added a delete button next to each tree item
- fixed event propagation so delete clicks did not trigger unwanted selection
- fixed deletion behavior for parent/child subtrees
- fixed selection clearing after delete
- fixed the object count logic and stopped deriving UI count from repeated scene traversal

Why this came first:

- these were user-visible correctness issues
- they were directly tied to the requested take-home feature

Tradeoff:

- the code still used the original architecture at this stage
- the goal here was safe behavior, not a full redesign

### Phase 2: Tests around the real flows

Once the main behavior worked, the next step was to add tests for the important user flows.

Tests were added for:

- creating root shapes
- creating child shapes
- selecting from canvas
- selecting from tree
- deleting a child
- deleting a parent subtree
- clearing selection after delete
- updating the project name
- showing geometry type and color
- collapsing and expanding tree nodes

Why this came next:

- after changing deletion, selection, and count logic, tests were needed to prevent regressions

Tradeoff:

- tests initially relied on some app bootstrap behavior that was still awkward
- that helped expose where the app structure needed improvement

### Phase 3: Move toward a better app state model

The next major step was to separate UI state from raw scene objects.

Final direction:

- introduced `ShapeProvider`
- introduced a normalized shape model
- tracked:
  - `shapesById`
  - `rootShapeIds`
  - `selectedShapeId`
  - `meshById`

Why this was important:

- it made the tree render from app state rather than directly from live scene objects
- it improved testability and maintainability
- it created a cleaner place for shape actions

Tradeoff:

- this was a larger refactor than a small feature patch
- to keep the transition safe, the provider was introduced in stages instead of rewriting everything at once

### Phase 4: Consolidate the app into one React tree

Originally, different parts of the UI were mounted separately, which made shared app state awkward.

Changes:

- moved the app to a single React root
- rendered toolbar, panel, canvas, and shape tree under one provider

Why this mattered:

- a provider cannot be the real source of truth if the app is split into disconnected roots

Tradeoff:

- bootstrap code changed more than the feature itself required
- but this was necessary to make the provider architecture coherent

### Phase 5: Make the provider the real action owner

After introducing provider state, the next step was to stop treating it as just a mirror of controller notifications.

Final solution:

- `ShapeProvider` owns:
  - create shape
  - delete shape
  - delete selected shape
  - select shape from tree
  - select shape from canvas
  - project name state
- Three.js is used as the rendering layer
- `MainViewController` and the notification center are left in the repo but marked deprecated

Why this was the final architecture choice:

- it gives React a real source of truth
- it reduces coupling between UI code and Three.js internals
- it removes the need for the UI to subscribe to legacy notification flows

Tradeoff:

- this leaves some deprecated code in place rather than deleting it immediately
- that was a deliberate choice to reduce risk and keep the evolution understandable

## Performance and Scalability Improvements

Several targeted improvements were made while iterating:

- moved app/UI state into a normalized provider structure
- reduced reliance on broad notification-driven updates
- changed object counting from repeated `O(n)` full-scene traversal to incremental tracking with `O(1)` reads
- improved selection updates so they no longer clear highlight across the full scene
- reused a single raycast service where appropriate

Remaining tradeoff:

- the app is in a much better place than the starting point, but a full production-scale editor would likely need more work around:
  - scene indexing
  - virtualization for very large trees
  - stricter separation between render objects and app models

## UI Improvements

After correctness and state flow were stabilized, the UI was improved to make the app easier to understand:

- redesigned top toolbar with inline project name editing
- improved add-shape panel layout
- improved shape tree layout and hover/selection affordances
- added accordion support for nested shapes
- improved tree scrolling behavior so nesting does not create awkward overflow behavior
- added lighting and shaded materials to improve scene readability

Tradeoff:

- styling changes were intentionally secondary to correctness and architecture
- the goal was a cleaner and more usable interface, not a full visual redesign

## Final State

The final solution is intentionally iterative rather than a complete rewrite.

What it achieves:

- requested feature implemented
- bonus feature implemented
- tests added for the main flows
- app state moved into a dedicated provider
- single React tree instead of fragmented UI mounting
- deprecated legacy state flow clearly separated from the active app path
- improved scene rendering and tree usability

Why this approach was chosen:

- it improves the project in clear steps
- it keeps the changes explainable in git history
- it prioritizes reliability, maintainability, and scalability over unnecessary rewrite scope
