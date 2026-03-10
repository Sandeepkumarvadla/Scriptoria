import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  User,
  Volume2,
  FileText,
  Download,
  Loader2,
  Sparkles,
  FileDown,
  File,
} from "lucide-react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import DOMPurify from "dompurify";
import { GoogleGenAI } from "@google/genai";

// Initialize pdfMake fonts
// @ts-ignore
pdfMake.vfs = pdfFonts && pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : globalThis.pdfMake.vfs;

type GenerationType = "screenplay" | "character" | "sound";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<GenerationType>("screenplay");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story idea first.");
      return;
    }

    const sanitizedPrompt = DOMPurify.sanitize(prompt);

    setIsGenerating(true);
    setError("");
    setGeneratedContent("");

    try {
      // Initialize GoogleGenAI right before making the API call
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      let systemInstruction = 'You are an expert screenwriter and cinematic storyteller.';
      
      if (type === 'screenplay') {
        systemInstruction += ' Generate a professional screenplay scene based on the user prompt. Use industry-standard screenplay format: Scene headings in ALL CAPS, character names centered in ALL CAPS, dialogue centered, and action lines left-aligned. Provide a compelling narrative.';
      } else if (type === 'character') {
        systemInstruction += ' Generate deep character arcs based on the user prompt. Include background, motivations, flaws, and character development trajectory.';
      } else if (type === 'sound') {
        systemInstruction += ' Generate an emotional sound design plan based on the user prompt. Detail the ambient sounds, foley, musical score cues, and sound effects to enhance the cinematic experience.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: sanitizedPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (!response.text) {
        console.error("Gemini API Response:", response);
        throw new Error("Received empty response from Gemini API. Please try a different prompt.");
      }

      setGeneratedContent(response.text);
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while generating content. Please try again.";
      setError(`Error: ${errorMessage}`);
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportTxt = () => {
    const blob = new Blob([generatedContent], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `cinema-ai-${type}.txt`);
  };

  const exportDocx = async () => {
    const lines = generatedContent.split("\n");

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: lines.map((line) => {
            const isAllCaps =
              line.trim().length > 0 && line === line.toUpperCase();
            return new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: "Cambria",
                  size: 22, // 11pt (half-points in docx)
                  bold: isAllCaps,
                }),
              ],
              spacing: {
                line: 360, // 1.5x line spacing (240 is 1.0x)
                after: 200, // Paragraph spacing
              },
            });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `cinema-ai-${type}.docx`);
  };

  const exportPdf = () => {
    // Parse content to apply basic screenplay formatting
    const lines = generatedContent.split("\n");
    const formattedContent = lines.map((line) => {
      const isAllCaps = line.trim().length > 0 && line === line.toUpperCase();

      return {
        text: line,
        style: isAllCaps ? "heading" : "body",
        margin: [0, 0, 0, 10], // Add some paragraph spacing
      };
    });

    const docDefinition = {
      content: formattedContent,
      styles: {
        body: {
          font: "Roboto",
          fontSize: 11,
          lineHeight: 1.5,
        },
        heading: {
          font: "Roboto",
          fontSize: 11,
          lineHeight: 1.5,
          bold: true,
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    // @ts-ignore
    pdfMake.createPdf(docDefinition).download(`cinema-ai-${type}.pdf`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Film className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="font-semibold tracking-tight text-lg">
              Cinema AI Studio
            </h1>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            v1.0.0 // LOCAL INFERENCE MODE
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Director's Chair
            </h2>
            <p className="text-zinc-400 text-sm">
              Describe your vision. The AI will handle the formatting.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Generation Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <TypeButton
                active={type === "screenplay"}
                onClick={() => setType("screenplay")}
                icon={<FileText className="w-4 h-4" />}
                label="Screenplay"
              />
              <TypeButton
                active={type === "character"}
                onClick={() => setType("character")}
                icon={<User className="w-4 h-4" />}
                label="Character"
              />
              <TypeButton
                active={type === "sound"}
                onClick={() => setType("sound")}
                icon={<Volume2 className="w-4 h-4" />}
                label="Sound"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Story Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A neo-noir detective discovers that the city's rain is actually a complex code..."
              className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {type.charAt(0).toUpperCase() + type.slice(1)}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[600px] bg-zinc-900/30 border border-zinc-800/50 rounded-2xl flex flex-col overflow-hidden relative">
            {/* Output Header */}
            <div className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-4 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Output Terminal
                </span>
              </div>

              <AnimatePresence>
                {generatedContent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2"
                  >
                    <ExportButton
                      onClick={exportTxt}
                      icon={<File className="w-3 h-3" />}
                      label="TXT"
                    />
                    <ExportButton
                      onClick={exportDocx}
                      icon={<FileDown className="w-3 h-3" />}
                      label="DOCX"
                    />
                    <ExportButton
                      onClick={exportPdf}
                      icon={<Download className="w-3 h-3" />}
                      label="PDF"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Output Content */}
            <div className="flex-1 p-6 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-4"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-sm font-mono animate-pulse">
                      Synthesizing narrative parameters...
                    </p>
                  </motion.div>
                ) : generatedContent ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed"
                  >
                    {generatedContent}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm font-mono"
                  >
                    Awaiting input...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
        active
          ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
          : "bg-zinc-900/50 text-zinc-400 border border-transparent hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ExportButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="h-8 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
