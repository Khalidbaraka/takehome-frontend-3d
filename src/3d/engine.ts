import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import type { ThemeMode } from "../theme/ThemeProvider";

const DEFAULT_CAMERA_POSITION = new Vector3(10, 10, 10);
const DEFAULT_CAMERA_TARGET = new Vector3(0, 0, 0);
const CAMERA_ANIMATION_DURATION_MS = 280;

const SCENE_THEMES = {
  dark: {
    background: 0x1a1d23,
    grid: 0x2a2d35,
    hemisphereSky: 0xe2e8f0,
    hemisphereGround: 0x111827,
    ambient: 0xffffff,
    key: 0xffffff,
    fill: 0x93c5fd,
  },
  light: {
    background: 0xf4f7fb,
    grid: 0x94a3b8,
    hemisphereSky: 0xffffff,
    hemisphereGround: 0xdbe4f0,
    ambient: 0xffffff,
    key: 0xffffff,
    fill: 0x60a5fa,
  },
};

export default class ThreeEngineController {
  private static instance?: ThreeEngineController;

  private scene = new Scene();
  private camera?: PerspectiveCamera;
  private renderer?: WebGLRenderer;
  private controls?: OrbitControls;
  private currentTheme: ThemeMode = "dark";
  private isSceneInitialized: boolean = false;
  private frameId: number | null = null;
  private cameraAnimationFrameId: number | null = null;
  private isFocusedView = false;

  private constructor() {}

  static getInstance() {
    return (ThreeEngineController.instance ??= new ThreeEngineController());
  }

  static dispose() {
    ThreeEngineController.instance?.destroy();
    ThreeEngineController.instance = undefined;
  }

  install(canvasElement: HTMLCanvasElement) {
    if (this.isSceneInitialized) {
      console.warn("Scene is already initialized");
      return;
    }

    this.scene = buildScene();
    this.camera = buildCamera(canvasElement);
    this.renderer = buildRenderer(canvasElement);
    this.controls = buildControls(this.camera, canvasElement);

    this.controls.addEventListener("change", () => {
      this.requestRender();
    });

    this.isSceneInitialized = true;

    this.updateSize(canvasElement);
    this.requestRender();
  }

  applyTheme(theme: ThemeMode) {
    this.currentTheme = theme;
    applySceneTheme(this.scene, theme);

    if (this.renderer) {
      const colors = SCENE_THEMES[theme];
      this.renderer.setClearColor(colors.background, 1);
    }

    this.requestRender();
  }

  clientToNdc({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }): [number, number] {
    if (!this.renderer) {
      throw new Error("Renderer is not initialized");
    }

    const { left, top, width, height } =
      this.renderer.domElement.getBoundingClientRect();

    const x = ((clientX - left) / width) * 2 - 1;
    const y = -((clientY - top) / height) * 2 + 1;

    return [x, y];
  }

  getObjectsInScene() {
    if (!this.scene) {
      throw new Error("Scene is not initialized");
    }

    return this.scene.children;
  }

  getCamera() {
    if (!this.camera) {
      throw new Error("Camera is not initialized");
    }

    return this.camera;
  }

  render() {
    if (!this.isSceneInitialized) {
      throw new Error("Scene should be initialized before rendering");
    }

    if (!this.scene || !this.camera || !this.renderer) {
      throw new Error(
        "Scene, camera, renderer, and controls must be defined before rendering",
      );
    }

    this.renderer.render(this.scene, this.camera);
  }

  focusObject(object: Object3D) {
    if (!this.camera || !this.controls) {
      throw new Error(
        "Camera and controls must be initialized before focusing",
      );
    }

    const box = new Box3().setFromObject(object);
    const center = new Vector3();
    const size = new Vector3();

    if (box.isEmpty()) {
      object.getWorldPosition(center);
      size.setScalar(1);
    } else {
      box.getCenter(center);
      box.getSize(size);
    }

    const currentOffset = this.camera.position
      .clone()
      .sub(this.controls.target);
    const direction =
      currentOffset.lengthSq() > 0
        ? currentOffset.normalize()
        : new Vector3(1, 1, 1).normalize();
    const radius = Math.max(size.length() * 0.5, 1);
    const distance = Math.max(
      radius * 6,
      this.controls.minDistance + radius * 3,
    );

    this.isFocusedView = true;
    this.animateCamera(
      center.clone().add(direction.multiplyScalar(distance)),
      center,
    );
  }

  resetView() {
    if (!this.camera || !this.controls) {
      throw new Error(
        "Camera and controls must be initialized before resetting view",
      );
    }

    this.isFocusedView = false;
    this.animateCamera(DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_TARGET);
  }

  hasFocusedView() {
    return this.isFocusedView;
  }

  requestRender() {
    if (!this.isSceneInitialized || this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.render();
    });
  }

  updateSize(canvasElement: HTMLCanvasElement) {
    if (!this.camera) {
      throw new Error("Camera is not initialized, skipping resize.");
    }

    if (!this.renderer) {
      throw new Error("Renderer is not initialized, skipping resize.");
    }

    adjustObjectsForCanvas(
      { renderer: this.renderer, camera: this.camera },
      canvasElement,
    );
    this.requestRender();
  }

  addToScene(object: Object3D) {
    if (!this.scene) {
      throw new Error("Scene is not initialized");
    }

    this.scene.add(object);
    this.requestRender();
  }

  private destroy() {
    console.warn("Destroying Three Engine");

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    if (this.cameraAnimationFrameId !== null) {
      cancelAnimationFrame(this.cameraAnimationFrameId);
      this.cameraAnimationFrameId = null;
    }
    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene?.clear();
    this.camera?.clear();
    this.isFocusedView = false;

    this.isSceneInitialized = false;
  }

  private animateCamera(nextPosition: Vector3, nextTarget: Vector3) {
    if (!this.camera || !this.controls) {
      throw new Error(
        "Camera and controls must be initialized before animating",
      );
    }

    if (this.cameraAnimationFrameId !== null) {
      cancelAnimationFrame(this.cameraAnimationFrameId);
      this.cameraAnimationFrameId = null;
    }

    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startedAt = performance.now();

    const tick = (now: number) => {
      if (!this.camera || !this.controls) {
        return;
      }

      const progress = Math.min(
        (now - startedAt) / CAMERA_ANIMATION_DURATION_MS,
        1,
      );
      const eased = easeInOutCubic(progress);

      this.camera.position.lerpVectors(startPosition, nextPosition, eased);
      this.controls.target.lerpVectors(startTarget, nextTarget, eased);
      this.controls.update();
      this.requestRender();

      if (progress < 1) {
        this.cameraAnimationFrameId = requestAnimationFrame(tick);
      } else {
        this.cameraAnimationFrameId = null;
      }
    };

    this.cameraAnimationFrameId = requestAnimationFrame(tick);
  }
}

function buildScene() {
  const scene = new Scene();
  scene.background = new Color(SCENE_THEMES.dark.background);

  const hemisphereLight = new HemisphereLight(
    SCENE_THEMES.dark.hemisphereSky,
    SCENE_THEMES.dark.hemisphereGround,
    1.1,
  );
  hemisphereLight.name = "theme-hemisphere-light";
  const ambientLight = new AmbientLight(SCENE_THEMES.dark.ambient, 0.45);
  ambientLight.name = "theme-ambient-light";
  const keyLight = new DirectionalLight(SCENE_THEMES.dark.key, 1.4);
  keyLight.name = "theme-key-light";
  keyLight.position.set(6, 10, 8);

  const fillLight = new DirectionalLight(SCENE_THEMES.dark.fill, 0.45);
  fillLight.name = "theme-fill-light";
  fillLight.position.set(-5, 4, -6);

  const grid = new GridHelper(
    20,
    20,
    SCENE_THEMES.dark.grid,
    SCENE_THEMES.dark.grid,
  );
  grid.name = "theme-grid";
  scene.add(hemisphereLight, ambientLight, keyLight, fillLight, grid);

  return scene;
}

function buildRenderer(canvasElement: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
  });

  renderer.setClearColor(SCENE_THEMES.dark.background, 1);
  renderer.outputColorSpace = "srgb";

  return renderer;
}

function adjustObjectsForCanvas(
  { renderer, camera }: { renderer: WebGLRenderer; camera: PerspectiveCamera },
  canvasElement: HTMLCanvasElement,
) {
  const { clientWidth, clientHeight } = canvasElement;
  if (clientWidth === 0 || clientHeight === 0) {
    console.warn("Canvas has zero dimensions, skipping resize.");
    return;
  }

  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    canvasElement.clientWidth,
    canvasElement.clientHeight,
    false,
  );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function buildCamera(canvasElement: HTMLCanvasElement) {
  const { clientWidth, clientHeight } = canvasElement;
  const aspectRatio = clientWidth / clientHeight;

  const camera = new PerspectiveCamera(
    75,
    isNaN(aspectRatio) ? 1 : aspectRatio,
    0.1,
    1000,
  );
  camera.position.copy(DEFAULT_CAMERA_POSITION);
  camera.lookAt(DEFAULT_CAMERA_TARGET);

  return camera;
}

function buildControls(
  camera: PerspectiveCamera,
  canvasElement: HTMLCanvasElement,
) {
  const controls = new OrbitControls(camera, canvasElement);
  controls.enableDamping = false;
  controls.minDistance = 1;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2;

  return controls;
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function applySceneTheme(scene: Scene, theme: ThemeMode) {
  const colors = SCENE_THEMES[theme];
  scene.background = new Color(colors.background);

  const hemisphereLight = scene.getObjectByName("theme-hemisphere-light");
  if (hemisphereLight instanceof HemisphereLight) {
    hemisphereLight.color.setHex(colors.hemisphereSky);
    hemisphereLight.groundColor.setHex(colors.hemisphereGround);
  }

  const ambientLight = scene.getObjectByName("theme-ambient-light");
  if (ambientLight instanceof AmbientLight) {
    ambientLight.color.setHex(colors.ambient);
  }

  const keyLight = scene.getObjectByName("theme-key-light");
  if (keyLight instanceof DirectionalLight) {
    keyLight.color.setHex(colors.key);
  }

  const fillLight = scene.getObjectByName("theme-fill-light");
  if (fillLight instanceof DirectionalLight) {
    fillLight.color.setHex(colors.fill);
  }

  const oldGrid = scene.getObjectByName("theme-grid");
  if (oldGrid) {
    scene.remove(oldGrid);
  }
  const newGrid = new GridHelper(20, 20, colors.grid, colors.grid);
  newGrid.name = "theme-grid";
  scene.add(newGrid);
}
