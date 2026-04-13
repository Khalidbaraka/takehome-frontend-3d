import React from "react";
import { useShapes } from "../shapes/ShapeProvider";

const CountComponent: React.FC = () => {
  const { shapeCount } = useShapes();
  return <h2>{shapeCount} objects in scene</h2>;
};

export default CountComponent;
