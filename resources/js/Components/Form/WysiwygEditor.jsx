import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import InputError from "@/Components/InputError";

/**
 * WYSIWYG Editor component using ReactQuill
 *
 * Note: ReactQuill may show a findDOMNode deprecation warning in development.
 * This is a known issue with ReactQuill v2.0.0 and doesn't affect functionality.
 * The warning will not appear in production builds.
 */
export function WysiwygEditor({
  value,
  onChange,
  error,
  placeholder = "Enter content here...",
  className = "",
  height = "200px",
}) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "align",
    "link",
    "image",
  ];

  return (
    <div className={`w-full ${className}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                    .wysiwyg-editor {
                        width: 100% !important;
                    }
                    .wysiwyg-editor .ql-container {
                        width: 100% !important;
                        border-bottom-left-radius: 0.375rem;
                        border-bottom-right-radius: 0.375rem;
                    }
                    .wysiwyg-editor .ql-toolbar {
                        width: 100% !important;
                        border-top-left-radius: 0.375rem;
                        border-top-right-radius: 0.375rem;
                    }
                    .wysiwyg-editor .ql-editor {
                        min-height: ${height};
                        font-size: 14px;
                        line-height: 1.6;
                        width: 100% !important;
                    }
                    .wysiwyg-editor .ql-container.ql-snow {
                        border-color: #d1d5db;
                    }
                    .wysiwyg-editor .ql-toolbar.ql-snow {
                        border-color: #d1d5db;
                    }
                    .wysiwyg-editor .ql-container.ql-snow:focus-within {
                        border-color: #6366f1;
                        box-shadow: 0 0 0 1px #6366f1;
                    }
                    .wysiwyg-editor .ql-toolbar.ql-snow:focus-within {
                        border-color: #6366f1;
                    }
                    .wysiwyg-editor .ql-editor.ql-blank::before {
                        color: #9ca3af;
                        font-style: italic;
                    }
                    
                    /* Responsive design */
                    @media (max-width: 640px) {
                        .wysiwyg-editor .ql-toolbar {
                            padding: 8px;
                        }
                        .wysiwyg-editor .ql-toolbar .ql-formats {
                            margin-right: 8px;
                        }
                        .wysiwyg-editor .ql-editor {
                            font-size: 16px; /* Better for mobile touch */
                            padding: 12px;
                        }
                    }
                    
                    @media (min-width: 641px) {
                        .wysiwyg-editor .ql-toolbar {
                            padding: 12px;
                        }
                        .wysiwyg-editor .ql-editor {
                            padding: 16px;
                        }
                    }
                    
                    /* Ensure ReactQuill takes full width */
                    .wysiwyg-editor .quill {
                        width: 100% !important;
                    }
                    .wysiwyg-editor .ql-container.ql-snow {
                        width: 100% !important;
                    }
                    .wysiwyg-editor .ql-toolbar.ql-snow {
                        width: 100% !important;
                    }
                `,
        }}
      />
      <div className="wysiwyg-editor w-full">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height: "auto", width: "100%" }}
          className="w-full"
        />
      </div>
      {error && <InputError message={error} className="mt-2" />}
    </div>
  );
}
