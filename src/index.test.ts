import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3 } from "three";
import ThreeEngineController from "./3d/engine";
import {
  withApp,
  queueMockShape,
  findButtonByText,
  waitFor,
  findDeleteButton,
  findToggleButton,
  findChildrenContainer,
  findColorSwatch,
  findShapeItem,
  findShapeHeader,
  clickElement,
  flushUi,
} from "./test-utils";

vi.mock("./3d/buildShape", { spy: true });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App Features", () => {
  it("should create a root shape and update the shape list and total count", async () => {
    const rootMesh = queueMockShape("sphere", {
      color: 0xff0000,
      uuid: "shape-root-a",
    });
    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Sphere"));

      clickElement(findButtonByText(app.root, "Sphere"));
      const treeItem = await waitFor(() =>
        findShapeItem(app.root, rootMesh.uuid),
      );

      expect(treeItem).not.toBeNull();
      expect(app.root.textContent).toContain("1 objects");
    });
  });

  it("should create a child shape under the selected parent and render the hierarchy correctly", async () => {
    const parentMesh = queueMockShape("cube", {
      color: 0x00ff00,
      uuid: "shape-parent-a",
    });
    const childMesh = queueMockShape("cylinder", {
      color: 0x0000ff,
      uuid: "shape-child-a",
    });
    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Cube"));

      clickElement(findButtonByText(app.root, "Cube"));
      await waitFor(() => findShapeItem(app.root, parentMesh.uuid));

      clickElement(findShapeItem(app.root, parentMesh.uuid));
      await flushUi();

      clickElement(findButtonByText(app.root, "Cylinder"));
      await waitFor(() => findShapeItem(app.root, childMesh.uuid));

      expect(findShapeItem(app.root, parentMesh.uuid)).not.toBeNull();
      expect(findShapeItem(app.root, childMesh.uuid)).not.toBeNull();
      expect(parentMesh.children).toContain(childMesh);
      expect(app.root.textContent).toContain("2 objects");
    });
  });

  it("should select a shape from the canvas and highlight the related item in the shape list", async () => {
    const rootMesh = queueMockShape("sphere", {
      color: 0xff0000,
      uuid: "shape-canvas-a",
      position: new Vector3(0, 0, 0),
    });
    await withApp(async (app) => {
      const canvas = (await waitFor(() =>
        app.root.querySelector('[data-testid="scene-canvas"]'),
      )) as HTMLCanvasElement;

      clickElement(findButtonByText(app.root, "Sphere"));
      await waitFor(() => findShapeItem(app.root, rootMesh.uuid));

      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        }),
      );
      await flushUi();

      const treeHeader = findShapeHeader(app.root, rootMesh.uuid);
      expect(rootMesh.userData.isSelected).toBe(true);
      expect(treeHeader).not.toBeNull();
      expect(treeHeader?.getAttribute("data-selected")).toBe("true");
    });
  });

  it("should select a shape from the shape list and highlight the related shape in the scene", async () => {
    const rootMesh = queueMockShape("cube", {
      color: 0x00ff00,
      uuid: "shape-tree-a",
    });
    const focusSpy = vi.spyOn(
      ThreeEngineController.getInstance(),
      "focusObject",
    );

    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Cube"));

      clickElement(findButtonByText(app.root, "Cube"));
      const treeItem = await waitFor(() =>
        findShapeItem(app.root, rootMesh.uuid),
      );

      clickElement(treeItem);
      await flushUi();

      expect(rootMesh.userData.isSelected).toBe(true);
      const treeHeader = findShapeHeader(app.root, rootMesh.uuid);
      expect(treeHeader).not.toBeNull();
      expect(treeHeader?.getAttribute("data-selected")).toBe("true");
      expect(focusSpy).toHaveBeenCalledWith(rootMesh);
    });
  });

  it("should delete a child from the tree without removing its siblings", async () => {
    const parentMesh = queueMockShape("cube", {
      color: 0xff0000,
      uuid: "shape-parent-b",
    });
    const childOne = queueMockShape("sphere", {
      color: 0x00ff00,
      uuid: "shape-child-b1",
    });
    const childTwo = queueMockShape("cylinder", {
      color: 0x0000ff,
      uuid: "shape-child-b2",
    });
    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Cube"));

      clickElement(findButtonByText(app.root, "Cube"));
      await waitFor(() => findShapeItem(app.root, parentMesh.uuid));

      clickElement(findShapeItem(app.root, parentMesh.uuid));
      await flushUi();

      clickElement(findButtonByText(app.root, "Sphere"));
      clickElement(findButtonByText(app.root, "Cylinder"));
      await waitFor(() => findShapeItem(app.root, childTwo.uuid));

      clickElement(findDeleteButton(app.root, childOne.uuid));
      await flushUi();

      expect(findShapeItem(app.root, parentMesh.uuid)).not.toBeNull();
      expect(findShapeItem(app.root, childOne.uuid)).toBeNull();
      expect(findShapeItem(app.root, childTwo.uuid)).not.toBeNull();
      expect(app.root.textContent).toContain("2 objects");
    });
  });

  it("should delete a parent from the tree and remove its entire subtree", async () => {
    const parentMesh = queueMockShape("cube", {
      color: 0xff0000,
      uuid: "shape-parent-c",
    });
    queueMockShape("sphere", {
      color: 0x00ff00,
      uuid: "shape-child-c1",
    });
    queueMockShape("cylinder", {
      color: 0x0000ff,
      uuid: "shape-child-c2",
    });
    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Cube"));

      clickElement(findButtonByText(app.root, "Cube"));
      await waitFor(() => findShapeItem(app.root, parentMesh.uuid));

      clickElement(findShapeItem(app.root, parentMesh.uuid));
      await flushUi();

      clickElement(findButtonByText(app.root, "Sphere"));
      clickElement(findButtonByText(app.root, "Cylinder"));
      await waitFor(() => findDeleteButton(app.root, parentMesh.uuid));

      clickElement(findDeleteButton(app.root, parentMesh.uuid));
      await flushUi();

      expect(app.root.querySelectorAll(".shape-item")).toHaveLength(0);
      expect(app.root.textContent).toContain("0 objects");
    });
  });

  it("should clear the selection after deletion so adding a new shape works correctly", async () => {
    const parentMesh = queueMockShape("cube", {
      color: 0xff0000,
      uuid: "shape-parent-d",
    });
    queueMockShape("sphere", {
      color: 0x00ff00,
      uuid: "shape-child-d1",
    });
    const replacementRoot = queueMockShape("cylinder", {
      color: 0x0000ff,
      uuid: "shape-root-d2",
    });
    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Cube"));

      clickElement(findButtonByText(app.root, "Cube"));
      await waitFor(() => findShapeItem(app.root, parentMesh.uuid));

      clickElement(findShapeItem(app.root, parentMesh.uuid));
      await flushUi();

      clickElement(findButtonByText(app.root, "Sphere"));
      await waitFor(() => findDeleteButton(app.root, parentMesh.uuid));

      clickElement(findDeleteButton(app.root, parentMesh.uuid));
      await flushUi();

      clickElement(findButtonByText(app.root, "Cylinder"));
      await waitFor(() => findShapeItem(app.root, replacementRoot.uuid));

      expect(replacementRoot.parent?.type).toBe("Scene");
      expect(
        app.root.querySelectorAll('[data-testid^="shape-item-"]'),
      ).toHaveLength(1);
      expect(findShapeItem(app.root, replacementRoot.uuid)).not.toBeNull();
    });
  });

  it("should be able to update the project name and show the updated name in the shape list", async () => {
    await withApp(async (app) => {
      const editButton = await waitFor(
        () =>
          app.root.querySelector(
            '[aria-label="Edit project name"]',
          ) as HTMLElement | null,
      );

      clickElement(editButton);
      await flushUi();

      const input = app.root.querySelector(
        '[aria-label="Project name"]',
      ) as HTMLInputElement | null;
      expect(input).not.toBeNull();
      if (!input) {
        return;
      }

      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(input, "Updated Project");
      input.dispatchEvent(new Event("input", { bubbles: true }));

      clickElement(
        app.root.querySelector(
          '[aria-label="Save project name"]',
        ) as HTMLElement | null,
      );
      await flushUi();

      expect(
        app.root.querySelector('[data-testid="toolbar-project-name"]')
          ?.textContent,
      ).toBe("Updated Project");
      expect(
        app.root.querySelector('[data-testid="shape-tree-project-name"]')
          ?.textContent,
      ).toBe("Updated Project");
    });
  });

  it("should show the shape's geometry type and color in the tree view", async () => {
    const rootMesh = queueMockShape("sphere", {
      color: 0xff0000,
      uuid: "shape-bonus-a",
    });
    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Sphere"));

      clickElement(findButtonByText(app.root, "Sphere"));
      const treeItem = await waitFor(() =>
        findShapeItem(app.root, rootMesh.uuid),
      );

      expect(treeItem?.textContent).toContain("sphere");
      expect(
        findColorSwatch(app.root, rootMesh.uuid)?.style.backgroundColor,
      ).toBe("rgb(255, 0, 0)");
    });
  });

  it("should collapse and expand child shapes from the tree", async () => {
    const parentMesh = queueMockShape("cube", {
      color: 0xff0000,
      uuid: "shape-parent-e",
    });
    const childMesh = queueMockShape("sphere", {
      color: 0x00ff00,
      uuid: "shape-child-e1",
    });

    await withApp(async (app) => {
      await waitFor(() => findButtonByText(app.root, "Cube"));

      clickElement(findButtonByText(app.root, "Cube"));
      await waitFor(() => findShapeItem(app.root, parentMesh.uuid));

      clickElement(findShapeItem(app.root, parentMesh.uuid));
      await flushUi();

      clickElement(findButtonByText(app.root, "Sphere"));
      await waitFor(() => findShapeItem(app.root, childMesh.uuid));

      clickElement(findToggleButton(app.root, parentMesh.uuid));
      await flushUi();

      expect(
        findChildrenContainer(
          app.root,
          parentMesh.uuid,
        )?.parentElement?.parentElement?.getAttribute("data-state"),
      ).toBe("closed");

      clickElement(findToggleButton(app.root, parentMesh.uuid));
      const childTreeItem = await waitFor(() =>
        findShapeItem(app.root, childMesh.uuid),
      );

      expect(childTreeItem).not.toBeNull();
      expect(
        findChildrenContainer(
          app.root,
          parentMesh.uuid,
        )?.parentElement?.parentElement?.getAttribute("data-state"),
      ).toBe("open");
    });
  });
});
