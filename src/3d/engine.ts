import {
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default class ThreeEngineController {
  private static instance?: ThreeEngineController;

  private scene = new Scene();
  private camera?: PerspectiveCamera;
  private renderer?: WebGLRenderer;
  private controls?: OrbitControls;
  private objectCount = 0;
  private isSceneInitialized: boolean = false;

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

    // not sure i understand this listenser...
    this.controls.addEventListener("change", () => {
      this.render();
    });

    this.isSceneInitialized = true;

    this.updateSize(canvasElement);
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

  getObjectCount() {
    return this.objectCount;
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
  }

  addToScene(object: Object3D) {
    if (!this.scene) {
      throw new Error("Scene is not initialized");
    }

    this.scene.add(object);
  }

  removeFromScene(object: Object3D) {
    if (!this.scene) {
      throw new Error("Scene is not initialized");
    }

    this.scene.remove(object);
  }

  trackAddedObject(object: Object3D) {
    this.objectCount += countMeshes(object);
  }

  trackRemovedObject(object: Object3D) {
    this.objectCount = Math.max(0, this.objectCount - countMeshes(object));
  }

  private destroy() {
    console.warn("Destroying Three Engine");

    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene?.clear();
    this.camera?.clear();
    this.objectCount = 0;

    this.isSceneInitialized = false;
  }
}

function buildScene() {
  const scene = new Scene();
  scene.background = new Color(0x1a1d23);

  const hemisphereLight = new HemisphereLight(0xe2e8f0, 0x111827, 1.1);
  const ambientLight = new AmbientLight(0xffffff, 0.45);
  const keyLight = new DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(6, 10, 8);

  const fillLight = new DirectionalLight(0x93c5fd, 0.45);
  fillLight.position.set(-5, 4, -6);

  scene.add(hemisphereLight, ambientLight, keyLight, fillLight);

  return scene;
}

function buildRenderer(canvasElement: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
  });

  renderer.setClearColor(0x1a1d23, 1);
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
  camera.position.fromArray([10, 10, 10]);
  camera.lookAt(new Vector3(0, 0, 0));

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

function countMeshes(object: Object3D) {
  let count = 0;
  object.traverse((child) => {
    if (child instanceof Mesh) {
      count++;
    }
  });
  return count;
}
