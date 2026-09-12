"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "next-themes";

interface TinyEditorProps {
  id?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function TinyEditor({
  id = "tiny-editor",
  value,
  onChange,
  placeholder = "พิมพ์เนื้อหาข่าวแบบละเอียด...",
  height = 320,
  disabled = false,
}: TinyEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="tiny-editor-container rounded-lg overflow-hidden border border-border bg-background shadow-xs">
      <Editor
        id={id}
        licenseKey="gpl"
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        disabled={disabled}
        onEditorChange={(content) => onChange(content)}
        init={{
          base_url: "/tinymce",
          suffix: ".min",
          height,
          menubar: false,
          placeholder,
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic underline forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | link table code fullscreen",
          content_style:
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Thai', sans-serif; font-size: 14.5px; line-height: 1.65; color: " +
            (isDark ? "#f3f4f6" : "#1f2937") +
            "; background-color: " +
            (isDark ? "#121212" : "#ffffff") +
            "; }",
          branding: false,
          promotion: false,
          statusbar: true,
          elementpath: false,
        }}
      />
    </div>
  );
}
