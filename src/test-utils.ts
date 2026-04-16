import { initializeApp } from "../index";
import { expect, vi } from "vitest";
import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import * as buildShapeModule from "./3d/buildShape";

export function renderApp() {
  const root = document.createElement("div");
  root.style.width = "1200px";
  root.style.height = "800px";
  document.body.appendChild(root);

  const app = initializeApp(root);

  return {
    ...app,
    root,
    cleanup() {
      app.cleanup();
      root.remove();
    },
  };
}

export function queueMockShape(
  shape: "sphere" | "cube" | "cylinder",
  {
    color,
    position = new Vector3(0, 0, 0),
    uuid,
  }: { color: number; position?: Vector3; uuid: string },
) {
  const mesh = buildMesh(shape, color);
  mesh.uuid = uuid;

  vi.spyOn(mesh.position, "copy").mockImplementationOnce((vector) => {
    mesh.position.set(vector.x, vector.y, vector.z);
    mesh.position.set(position.x, position.y, position.z);
    return mesh.position;
  });

  vi.mocked(buildShapeModule.buildShape).mockImplementationOnce(() => mesh);

  return mesh;
}

function buildMesh(shape: "sphere" | "cube" | "cylinder", color: number) {
  const geometry =
    shape === "sphere"
      ? new SphereGeometry(1, 32, 32)
      : shape === "cube"
        ? new BoxGeometry(1, 1, 1)
        : new CylinderGeometry(1, 1, 2, 32);

  return new Mesh(geometry, new MeshBasicMaterial({ color }));
}

export function findShapeItem(root: HTMLElement, uuid: string) {
  return root.querySelector(
    `[data-testid="shape-item-${uuid}"]`,
  ) as HTMLDivElement | null;
}

export function findShapeHeader(root: HTMLElement, uuid: string) {
  return root.querySelector(
    `[data-testid="shape-header-${uuid}"]`,
  ) as HTMLDivElement | null;
}

export function findDeleteButton(root: HTMLElement, uuid: string) {
  return root.querySelector(
    `[data-testid="delete-shape-${uuid}"]`,
  ) as HTMLButtonElement | null;
}

export function findToggleButton(root: HTMLElement, uuid: string) {
  return root.querySelector(
    `[data-testid="toggle-shape-${uuid}"]`,
  ) as HTMLButtonElement | null;
}

export function findChildrenContainer(root: HTMLElement, uuid: string) {
  return root.querySelector(
    `[data-testid="shape-children-${uuid}"]`,
  ) as HTMLDivElement | null;
}

export function findColorSwatch(root: HTMLElement, uuid: string) {
  return root.querySelector(
    `[data-testid="shape-color-${uuid}"]`,
  ) as HTMLSpanElement | null;
}

export function findButtonByText(root: HTMLElement, text: string) {
  return [...root.querySelectorAll("button")].find(
    (button) => button.textContent?.trim() === text,
  ) as HTMLButtonElement | null;
}

export function clickElement(element: HTMLElement | null | undefined) {
  expect(element).not.toBeNull();
  element?.click();
}

export async function flushUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
}

export async function waitFor<T>(
  callback: () => T | null | undefined,
  attempts = 20,
) {
  for (let index = 0; index < attempts; index += 1) {
    const result = callback();
    if (result) {
      return result;
    }
    await flushUi();
  }

  return callback();
}

export async function withApp(
  run: (app: ReturnType<typeof renderApp>) => Promise<void>,
) {
  const app = renderApp();

  try {
    await run(app);
  } finally {
    app.cleanup();
  }
}
