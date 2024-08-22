import React, { useEffect, useRef, useState } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";
import { Button } from "react-bootstrap";
import axios from "axios";
import DropdownMenu from "./DropdownMenu";
import { LANGUAGES } from "../Constants";
import toast from "react-hot-toast";

function Editor({ socketRef, roomId, onCodeChange }) {
  const [output, setOutput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const runCodeHandler = async () => {
    if(!selectedLanguage) {
      toast.error("Please select a language to run");
      return;
    }
    const code = editorRef.current.getValue();
    try {
      const response = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          language: selectedLanguage,
          version: LANGUAGES[selectedLanguage],
          files: [
            {
              content: code,
            },
          ],
        }
      );
      setOutput(response.data.run.output);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("Error executing code");
    }
  };

  const editorRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      // for sync the code
      editorRef.current = editor;

      editor.setSize(null, "80%");
      editorRef.current.on("change", (instance, changes) => {
        // console.log("changes", instance ,  changes );
        const { origin } = changes;
        const code = instance.getValue(); // code has value which we write
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();
  }, []);

  // data receive from server
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div style={{ height: "600px" }}>
      <div className="my-3 d-flex justify-content-between">
        <DropdownMenu
          options={Object.keys(LANGUAGES)}
          onSelect={(language) => setSelectedLanguage(language)}
        />
        <Button variant="success" onClick={runCodeHandler} className="">
          Run
        </Button>{" "}
      </div>
      <textarea id="realtimeEditor"></textarea>

      <div className="p-2 my-2" style={{ backgroundColor: "#2A2A36" }}>
        <p>Output: </p>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default Editor;
