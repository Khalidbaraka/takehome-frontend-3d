import React from "react";
import { useShapeState } from "../shapes/ShapeProvider";

const CountComponent: React.FC = () => {
  const { shapeCount } = useShapeState();
  return <h2>{shapeCount} objects in scene</h2>;
};

export default CountComponent;
