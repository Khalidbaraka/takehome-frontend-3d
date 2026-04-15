import { useLayoutEffect, useRef } from "react";
import styles from "./SceneCanvas.module.css";
import ThreeEngineController from "../3d/engine";
import { useShapeActions } from "../shapes/ShapeProvider";

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectShapeFromCanvas } = useShapeActions();

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
