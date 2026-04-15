import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./SceneCanvas.module.css";
import ThreeEngineController from "../3d/engine";
import { useShapes } from "../shapes/ShapeProvider";

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectShapeFromCanvas } = useShapes();

  useEffect(() => {
    let frameId = 0;
    let isUnmounted = false;

    // This is the render loop, we call the render method of the engine on every frame
    const renderLoop = () => {
      if (isUnmounted) return;

      const engine = ThreeEngineController.getInstance();
      engine.render();
      frameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      isUnmounted = true;
      cancelAnimationFrame(frameId);
    };
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const engine = ThreeEngineController.getInstance();
    const handleResize = () => {
      engine.updateSize(canvas);
    };

    engine.install(canvas);
    window.addEventListener("resize", handleResize);

    return () => {
      ThreeEngineController.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      data-testid="scene-canvas"
      className={styles.threeCanvas}
      ref={canvasRef}
      onClick={(event) => {
        const engine = ThreeEngineController.getInstance();
        const point = engine.clientToNdc(event);
        selectShapeFromCanvas(point);
      }}
    />
  );
}
