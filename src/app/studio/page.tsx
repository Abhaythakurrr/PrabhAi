// app/studio/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks, PlayCircle, Code, Rocket, Lightbulb, Loader2, ImageIcon, FolderTree, FileCode2, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import NextImage from "next/image";
// Assuming these AI flows are correctly implemented and imported
import { generateAppFromDescription, type GenerateAppInput, type GenerateAppOutput } from '@/ai/flows/generate-app-from-description';
import { generateImageFromDescription } from '@/ai/flows/generate-image-from-description';
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast"; // Ensure this hook is correctly implemented and exported
import * as THREE from 'three'; // Ensure three is installed and @types/three is installed

// Import CodeMirror and necessary modes/addons - Standard imports for v5
import CodeMirror from 'codemirror'; // Default import for v5
import 'codemirror/lib/codemirror.css'; // Ensure this CSS is imported or linked
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets'; // Should work with v5
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
// If you need JSON linting and its linter (jshint, jsonlint)
// import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/hint/show-hint.css'; // Ensure this CSS is imported or linked
import 'codemirror/addon/lint/lint.css'; // Ensure this CSS is imported or linked

// Import CodeMirror themes if needed, e.g., monokai
import 'codemirror/theme/monokai.css';


// Make JSHINT and jsonlint available globally for linters if not already
// This might be needed depending on your setup. You might install 'jshint' and 'jsonlint'
// and import/configure them here or through your bundler.
// Example: import JSHINT from 'jshint'; window.JSHINT = JSHINT;
// Example: import jsonlint from 'jsonlint'; window.jsonlint = jsonlint;


export default function StudioPage() {
  // State variables
  const [appDescription, setAppDescription] = useState("");
  const [generatedApp, setGeneratedApp] = useState<GenerateAppOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studioImageUrl, setStudioImageUrl] = useState("https://placehold.co/600x400.png");
  // State for CodeMirror content - Initialize with a relevant AR code snippet
  const [code, setCode] = useState('// Start coding your AR experience here\n\nfunction createCube() {\n  const geometry = new THREE.BoxGeometry(1, 1, 1);\n  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });\n  const cube = new THREE.Mesh(geometry, material);\n  return cube;\n}\n\n// Add a cube to the scene (example)\n// const myCube = createCube();\n// scene.add(myCube);\n');
  const [aiCommand, setAiCommand] = useState(''); // State for AI command input

  // Refs for DOM elements and CodeMirror instance
  const editorRef = useRef<HTMLDivElement>(null); // Ref for the CodeMirror container div
  // Use CodeMirror.Editor type for the instance ref (should work with v5 types)
  const codeMirrorInstance = useRef<CodeMirror.Editor | null>(null); // Ref for the CodeMirror instance
  const arPreviewRef = useRef<HTMLDivElement>(null); // Ref for the AR preview container div

  // Hook for toasts
  const { toast } = useToast(); // Ensure useToast hook is correctly implemented and returns { toast }


  // Effect to fetch studio image on component mount
  useEffect(() => {
    const fetchStudioImage = async () => {
      try {
        // Ensure generateImageFromDescription is correctly imported and works server-side
        const output = await generateImageFromDescription({ description: "futuristic coding interface with cyberpunk aesthetic" });
        if (output.imageDataUri) {
          setStudioImageUrl(output.imageDataUri);
        }
      } catch (error) {
        console.error("Failed to generate studio image:", error);
        // Optional: Show a toast or visual feedback on failure
      }
    };
    fetchStudioImage();
  }, []); // Empty dependency array means this runs once on mount


  // Effect to initialize CodeMirror editor
  useEffect(() => {
    // Initialize CodeMirror only if the ref is attached and instance doesn't exist
    if (editorRef.current && !codeMirrorInstance.current) {
      codeMirrorInstance.current = CodeMirror(editorRef.current, {
        value: code, // Initial value from state
        mode: 'javascript', // Set mode to javascript
        theme: 'monokai', // Apply monokai theme (ensure monokai.css is imported)
        lineNumbers: true, // Show line numbers
        matchBrackets: true, // Enable bracket matching
        autoCloseBrackets: true, // Enable auto close brackets
        showHint: true, // Enable hinting
        hintOptions: { // Configure hinting options
           completeSingle: false, // Do not auto-complete if only one suggestion
           // Add a hint function if needed for custom suggestions
           // hint: CodeMirror.hint.javascript, // Use CodeMirror's default JS hint
        },
        lint: true, // Enable linting
        gutters: ["CodeMirror-lint-markers"], // Add gutter for lint markers
        // If using JSHint, ensure it's available globally or configured
        // lintWith: CodeMirror.lint.javascript,
        extraKeys: { // Define extra key bindings
            'Ctrl-Space': 'autocomplete', // Bind Ctrl-Space to autocomplete
            // Add other key bindings here
        },
      });

      // Subscribe to changes in the editor and update state
      // Explicitly type the editor parameter
      codeMirrorInstance.current.on('change', (editor: CodeMirror.Editor) => {
        setCode(editor.getValue());
      });
    }

    // Cleanup function to dispose of CodeMirror instance when component unmounts
    return () => {
      if (codeMirrorInstance.current) {
        // CodeMirror v5's toTextArea() should exist when initialized on a div
        // Use try-catch just in case or if the type definition is slightly off
        try {
           (codeMirrorInstance.current as any).toTextArea(); // Cast to any to bypass potential type issues if toTextArea exists
        } catch (e) {
            // Fallback manual cleanup if toTextArea is not available
            const wrapper = codeMirrorInstance.current.getWrapperElement();
            if (wrapper && wrapper.parentNode) {
                wrapper.parentNode.removeChild(wrapper);
            }
        }
        codeMirrorInstance.current = null;
      }
    };
  }, [editorRef]); // Dependency on editorRef ensures it runs after the ref is attached


   // Effect to initialize Three.js AR Scene (ensure THREE is imported)
   useEffect(() => {
     if (arPreviewRef.current) {
       const scene = new THREE.Scene();
       // Use arPreviewRef.current.clientWidth and clientHeight for responsive sizing
       const camera = new THREE.PerspectiveCamera(75, arPreviewRef.current.clientWidth / arPreviewRef.current.clientHeight, 0.1, 1000);
       const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Added antialias
       // Set renderer size to match container
       renderer.setSize(arPreviewRef.current.clientWidth, arPreviewRef.current.clientHeight);
       renderer.setClearColor(0x000000, 0); // Make background transparent
       arPreviewRef.current.appendChild(renderer.domElement);

       const geometry = new THREE.BoxGeometry();
       const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
       const cube = new THREE.Mesh(geometry, material);
       scene.add(cube);

       // Floating Info Panel (simulated landmark info) - Ensure it's positioned absolutely relative to arPreviewRef
       const infoPanel = document.createElement('div');
       infoPanel.style.position = 'absolute';
       infoPanel.style.background = 'rgba(0, 0, 0, 0.8)';
       infoPanel.style.color = '#00ff00';
       infoPanel.style.padding = '10px';
       infoPanel.style.border = '1px solid #00ff00';
       infoPanel.style.display = 'none';
       infoPanel.style.zIndex = '10'; // Ensure it's above the canvas
       infoPanel.innerHTML = 'Landmark: Eiffel Tower<br>Built: 1889<br>Info: Iconic Parisian monument';
       arPreviewRef.current.style.position = 'relative'; // Ensure container is positioned for absolute children
       arPreviewRef.current.appendChild(infoPanel);

       camera.position.z = 5;

       const raycaster = new THREE.Raycaster();
       const mouse = new THREE.Vector2();

       // Adjust onClick to use coordinates relative to the canvas
       const onClick = (event: MouseEvent) => {
         const rect = renderer.domElement.getBoundingClientRect();
         mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
         mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
         raycaster.setFromCamera(mouse, camera);
         const intersects = raycaster.intersectObjects([cube]); // Check for intersection with the cube
         if (intersects.length > 0) {
           // Position info panel near the clicked point
           infoPanel.style.left = `${event.clientX}px`;
           infoPanel.style.top = `${event.clientY}px`;
           infoPanel.style.display = 'block';
         } else {
           infoPanel.style.display = 'none';
         }
       };

       renderer.domElement.addEventListener('click', onClick);

       const animate = () => {
         requestAnimationFrame(animate);
         cube.rotation.x += 0.01;
         cube.rotation.y += 0.01;
         renderer.render(scene, camera);
       };
       animate();

       // Handle window resize
       const handleResize = () => {
           if (arPreviewRef.current) {
               const width = arPreviewRef.current.clientWidth;
               const height = arPreviewRef.current.clientHeight;
               renderer.setSize(width, height);
               camera.aspect = width / height;
               camera.updateProjectionMatrix();
           }
       };
       window.addEventListener('resize', handleResize);


       return () => {
         // Cleanup event listener and remove canvas/info panel
         renderer.domElement.removeEventListener('click', onClick);
         window.removeEventListener('resize', handleResize);
         if (arPreviewRef.current) {
           // Use optional chaining and check parentNode before attempting removal
           if(renderer.domElement.parentNode?.contains(renderer.domElement)) {
              arPreviewRef.current.removeChild(renderer.domElement);
           }
           if(infoPanel.parentNode?.contains(infoPanel)) {
             arPreviewRef.current.removeChild(infoPanel);
           }
         }
         renderer.dispose(); // Dispose renderer resources
       };
     }
   }, [arPreviewRef]); // Dependency on arPreviewRef ensures it runs after the ref is attached


  // Handler for generating app outline
  const handleGenerateApp = async () => {
    if (!appDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Prabh Needs Ideas!",
        description: "Describe the app you want Prabh to outline.",
      });
      return;
    }
    setIsLoading(true);
    setGeneratedApp(null);
    try {
      const input: GenerateAppInput = { appDescription };
      // Ensure generateAppFromDescription is correctly imported and works server-side
      const output = await generateAppFromDescription(input);
      setGeneratedApp(output);
      toast({
        title: "Prabh Sketched Your App!",
        description: "The app outline and snippets are ready.",
      });
    } catch (error) {
      console.error("Error generating app structure with Prabh:", error);
      toast({
        variant: "destructive",
        title: "Prabh's Blueprint Failed!",
        description: "Could not generate the app outline. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for running AI command
  const handleRunAiCommand = async () => {
    if (!aiCommand.trim()) {
         toast({
          variant: "destructive",
          title: "Command Needed!",
          description: "Please enter a command for Prabh AI.",
        });
        return;
    }
    toast({
      title: "Prabh is Processing...",
      description: `Running command: "${aiCommand}"`,
    });
    console.log("AI Command:", aiCommand);
    // Future: Send aiCommand and potentially current code to backend /api/ai/command
    // and handle the response (e.g., insert code, show message)
    setAiCommand(''); // Clear input after running
     // Example of how you might insert code if backend returns it:
     // if (generatedCodeSnippet) {
     //   codeMirrorInstance.current?.replaceSelection(generatedCodeSnippet);
     // }
  };

  // Handler for saving code
  const handleSaveCode = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to save code.",
        });
        return;
      }
      // Ensure the save endpoint is correct and handles the request body
      const res = await fetch('/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ensure the template literal is correctly closed with a backtick (`)
          'Authorization': `Bearer ${token}`, // Corrected template literal
        },
        // Ensure fileId and content are correctly sent.
        // You might need a way to get the current fileId from the selected project/file.
        body: JSON.stringify({ fileId: 'ar_scene.js', content: code }), // Using a hardcoded fileId for now
      });

      if (res.ok) {
        toast({
          title: "Code Saved!",
          description: "Your code has been saved successfully.",
        });
      } else {
        // Attempt to read error message from response
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Save failed:", errorData);
        toast({
          variant: "destructive",
          title: "Save Failed!",
          description: errorData.error || 'Could not save your code. Please try again.',
        });
      }
    } catch (error) {
      console.error("Save code error:", error);
      toast({
        variant: "destructive",
        title: "Save Failed!",
        description: "An unexpected error occurred while saving code.",
      });
    }
  };


  return (
    // Added classes for background gradient and pattern
    <div className="container mx-auto py-8 space-y-8 bg-[linear-gradient(135deg,#0d0d0d_0%,#1a1a1a_100%)] text-green-400 relative min-h-screen">
       {/* Added div for the dynamic background pattern */}
       <div className="absolute inset-0 bg-[url('https://i.imgur.com/3Z8Z9.gif')] bg-repeat opacity-10 z-[-1] animate-[bg-scroll_20s_linear_infinite]" style={{ backgroundSize: '200px' }}></div>


      <Card className="shadow-xl bg-[#0d0d0d] border border-green-400">
        <div className="md:flex">
          <div className="md:w-1/2 p-6 md:p-8">
            <CardHeader className="p-0 mb-4">
              {/* Added glitch animation class */}
              <CardTitle className="text-3xl md:text-4xl flex items-center gap-3 text-green-400 animate-[glitch_1s_linear_infinite]">
                <Blocks className="h-10 w-10" />
                Prabh AI Studio
              </CardTitle>
              <CardDescription className="text-lg mt-1 text-green-200">
                Your creative hub for building AI-powered AR/VR apps with Prabh.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-green-200">
                Welcome to Prabh AI Studio! Build immersive AR experiences with AI-driven code generation and real-time previews.
              </p>
              <div className="flex gap-2 flex-wrap">
                {/* Buttons with updated cyberpunk styling */}
                <Button size="lg" className="bg-green-400 text-black hover:bg-green-500 shadow-md hover:shadow-lg transition-shadow">
                  <Rocket className="mr-2 h-5 w-5" /> Start New Project
                </Button>
                <Button variant="outline" size="lg" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                  <PlayCircle className="mr-2 h-5 w-5" /> Prabh's Tutorials
                </Button>
              </div>
            </CardContent>
          </div>
          {/* Image/Visual area with styling */}
          <div className="md:w-1/2 bg-gradient-to-br from-green-400/20 to-green-800/20 flex items-center justify-center p-4 md:p-0 min-h-[200px] md:min-h-0">
            {studioImageUrl === "https://placehold.co/600x400.png" ? (
              <ImageIcon className="h-16 w-16 text-green-200" data-ai-hint="futuristic coding interface" />
            ) : (
              <NextImage
                src={studioImageUrl}
                alt="Prabh AI Studio Interface"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl object-cover border border-green-400"
                data-ai-hint="futuristic coding interface"
                unoptimized={studioImageUrl.startsWith('data:')}
              />
            )}
          </div>
        </div>
         {/* Footer with branding */}
         <CardFooter className="text-center text-sm text-green-200">
          Powered by Prabh AI
        </CardFooter>
      </Card>

      {/* === Integrated Code Editor & AR Preview Section === */}
      {/* Combined editor and preview into a single card/section */}
      <Card className="shadow-lg bg-[#0d0d0d] border border-green-400">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-green-400">
            <Code className="h-7 w-7" />
            Integrated Code Editor & AR Preview
          </CardTitle>
          <CardDescription className="text-green-200">
            Write code, interact with Prabh AI, and preview AR scenes in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Grid for editor and preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code Editor Column */}
            <div>
              {/* Editor container with styling */}
              <div ref={editorRef} className="h-96 border border-green-400 rounded-md overflow-hidden shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                {/* CodeMirror will initialize here */}
              </div>
              {/* AI Command Bar and Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <Textarea
                  placeholder="> Ask Prabh AI: Add a red cube to the scene..."
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  rows={1}
                  className="flex-1 bg-[#0d0d0d] text-green-400 border-green-400 placeholder:text-green-200 resize-none"
                />
                {/* Buttons with updated styling */}
                <Button onClick={handleRunAiCommand} className="bg-green-400 text-black hover:bg-green-500">Run AI</Button>
                <Button onClick={handleSaveCode} className="bg-green-400 text-black hover:bg-green-500">Save Code</Button>
              </div>
            </div>

            {/* AR Preview Column */}
            <div>
              <h3 className="text-lg mb-2 text-green-400">AR Preview</h3>
              {/* AR Preview container with styling */}
              <div ref={arPreviewRef} className="h-96 border border-green-400 rounded-md shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                 {/* Three.js canvas and info panel will be appended here */}
              </div>
            </div>
          </div>
        </CardContent>
        {/* Footer with branding */}
        <CardFooter>
          <p className="text-xs text-green-200 text-center w-full">
            AR preview and AI assistance powered by Prabh AI.
          </p>
        </CardFooter>
      </Card>
      {/* === End Integrated Code Editor & AR Preview Section === */}


      {/* === Generate App Outline Section (Existing) === */}
      {/* This section seems to be the existing functionality for generating app outlines */}
      {/* Ensure this section is still needed or if the IDE section replaces its purpose */}
      <Card className="shadow-lg bg-[#0d0d0d] border border-green-400">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-green-400">
            <Lightbulb className="h-7 w-7" />
            Generate App Outline with Prabh
          </CardTitle>
          <CardDescription className="text-green-200">
            Describe your app idea, and Prabh will sketch out a structure and code snippets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., An AR travel app with landmark info overlays, built with Next.js and Three.js..."
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            rows={4}
            className="bg-[#0d0d0d] text-green-400 border-green-400 placeholder:text-green-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateApp}
            disabled={isLoading || !appDescription.trim()}
            className="w-full text-lg py-3 bg-green-400 text-black hover:bg-green-500"
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
            {isLoading ? "Prabh is Generating..." : "Ask Prabh to Generate Outline"}
          </Button>
          {generatedApp && (
            <div className="space-y-6 mt-6">
              <Card className="bg-[#1a1a1a] border-green-400">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                    <FolderTree className="h-6 w-6" />
                    Prabh's Proposed Project Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-[#0d0d0d] p-3 rounded-md overflow-x-auto text-green-400 shadow-inner">
                    <code>{generatedApp.projectStructure}</code>
                  </pre>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a1a] border-green-400">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                    <FileCode2 className="h-6 w-6" />
                    Prabh's Example Code Snippets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-[#0d0d0d] p-3 rounded-md overflow-x-auto text-green-400 shadow-inner">
                    <code className="language-javascript">{generatedApp.codeSnippets}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-green-200 text-center w-full">
            Powered by Prabh AI
          </p>
        </CardFooter>
      </Card>
      {/* === End Generate App Outline Section === */}

       {/* Existing sections for Drag & Drop and Integrated Code Editor (now integrated above) */}
       {/* You might remove these if the new Integrated Code Editor section replaces them */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-primary">Drag & Drop Interface</CardTitle>
              <CardDescription className="text-muted-foreground">Visually construct your application\\\'s UI and logic. (Prabh is learning this!) </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted/20 rounded-md flex items-center justify-center border border-dashed border-border">
                <p className="text-muted-foreground">Visual Builder (Coming Soon)</p>
              </div>
            </CardContent>
          </Card>
           {/* This card for Integrated Code Editor is now replaced by the section above */}
          {/* <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-primary">Integrated Code Editor</CardTitle>
              <CardDescription className="text-muted-foreground">Fine-tune AI code or write custom scripts. (Prabh is getting this ready!)</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-40 bg-muted/20 rounded-md flex items-center justify-center border border-dashed border-border">
                <Code className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card> */}
        </div>


    </div>
  );
}
