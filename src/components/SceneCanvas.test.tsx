import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { act, useEffect } from "react";
import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import SceneCanvas from "./SceneCanvas";
import { ShapeProvider, useShapes } from "../shapes/ShapeProvider";

describe("SceneCanvas", () => {
  function CaptureActions({
    onCapture,
  }: {
    onCapture: (actions: ReturnType<typeof useShapes>) => void;
  }) {
    const actions = useShapes();

    useEffect(() => {
      onCapture(actions);
    }, [actions, onCapture]);

    return null;
  }

  async function renderSceneCanvas() {
    let actions: ReturnType<typeof useShapes> | undefined;
    const { getByTestId } = await render(
      <ShapeProvider>
        <CaptureActions
          onCapture={(nextActions) => {
            actions = nextActions;
          }}
        />
        <SceneCanvas />
      </ShapeProvider>,
    );
    const canvas = getByTestId("scene-canvas");

    return { actions: actions!, canvas };
  }

  test("should highlight a newly created shape on click", async () => {
    const mockedMesh = mockNewMesh({
      color: "rgb(255, 0, 0)",
      position: new Vector3(0, 0, 0),
    });
    const { actions, canvas } = await renderSceneCanvas();

    act(() => {
      actions.createShape("sphere");
    });

    expect(mockedMesh.material.color.getStyle()).toBe("rgb(255,0,0)");
    expect(mockedMesh.userData.isSelected).toBeFalsy();

    const $canvas = canvas.element();
    await canvas.click({
      clientX: $canvas.clientWidth / 2,
      clientY: $canvas.clientHeight / 2,
    });

    expect(mockedMesh.material.color.getStyle()).toBe("rgb(255,255,0)");
    expect(mockedMesh.userData.isSelected).toBe(true);
  });
});

import * as exports from "../3d/buildShape";
vi.mock("../3d/buildShape", { spy: true });

function mockNewMesh({
  color = "red",
  position = new Vector3(),
  mockedMesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color })),
}: {
  color?: string;
  mockedMesh?: Mesh<BufferGeometry, MeshBasicMaterial>;
  position?: Vector3;
} = {}) {
  vi.spyOn(mockedMesh.position, "copy").mockImplementationOnce(() => position);

  vi.mocked(exports.buildShape).mockImplementationOnce(() => mockedMesh);
  return mockedMesh;
}
