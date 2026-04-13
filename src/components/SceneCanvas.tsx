import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./SceneCanvas.module.css";
import ThreeEngineController from "../3d/engine";
import type { MainViewController } from "../3d/MainViewController";

export default function SceneCanvas({
  controller,
}: {
  controller: MainViewController;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // should we move it layoutEffect?
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
    const engine = ThreeEngineController.getInstance();
    const handleResize = () => {
      // no need to check if the canvas ref is current here because the engine.updateSize method already checks if the renderer is initialized and if not it throws an error, and the renderer is only initialized in the install method which is called after we check if the canvas ref is current
      if (!canvasRef.current) return;
      engine.updateSize(canvasRef.current);
    };

    if (canvasRef.current) {
      engine.install(canvasRef.current);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      ThreeEngineController.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return (
    <canvas
      data-testid="scene-canvas"
      className={styles.threeCanvas}
      ref={canvasRef}
      onClick={(event) => {
        const engine = ThreeEngineController.getInstance();
        const point = engine.clientToNdc(event);
        controller.selectShape(point);
      }}
    />
  );
}
