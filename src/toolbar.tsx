import { useState } from "react";
import "../styles/toolbar.css";
import CountComponent from "./components/CountComponent";
import { useShapes } from "./shapes/ShapeProvider";

export default function Toolbar() {
  const { projectName, setProjectName } = useShapes();
  const [draftName, setDraftName] = useState(projectName);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraftName(projectName);
    setIsEditing(true);
  };

  const saveName = () => {
    const nextName = draftName.trim() || "Untitled Project";
    setProjectName(nextName);
    setDraftName(nextName);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setDraftName(projectName);
    setIsEditing(false);
  };

  return (
    <div className="toolbar-shell">
      <div className="toolbar-title-group">
        {isEditing ? (
          <div className="toolbar-title-edit">
            <input
              aria-label="Project name"
              className="project-name-input"
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  saveName();
                }
                if (event.key === "Escape") {
                  cancelEditing();
                }
              }}
              autoFocus
            />
            <button
              aria-label="Save project name"
              className="toolbar-icon-button toolbar-icon-button-save"
              type="button"
              onClick={saveName}
            >
              <CheckIcon />
            </button>
            <button
              aria-label="Cancel project name edit"
              className="toolbar-icon-button"
              type="button"
              onClick={cancelEditing}
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <div className="toolbar-title-display">
            <h2 className="project-name">{projectName}</h2>
            <button
              aria-label="Edit project name"
              className="toolbar-icon-button"
              type="button"
              onClick={startEditing}
            >
              <PencilIcon />
            </button>
          </div>
        )}
      </div>
      <div id="react-toolbar-root">
        <CountComponent />
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14.06 6.19L16.91 3.34C17.69 2.56 18.95 2.56 19.73 3.34L20.66 4.27C21.44 5.05 21.44 6.31 20.66 7.09L17.81 9.94"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5L9.5 17L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
