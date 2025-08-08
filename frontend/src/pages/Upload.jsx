import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AppLayout } from "../components/layout/AppLayout";
import { Upload as UploadIcon, File, CheckCircle, AlertCircle, Code } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { backendApi } from "../lib/api";

const runtimes = [
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
];


export default function Upload() {
  const [formData, setFormData] = useState({
    name: "",
    runtime: "",
    description: "",
    commandLineArgs: "",
    code: "",
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMode, setUploadMode] = useState("file");
  const { toast } = useToast();
  const { user } = useAuth();
 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Current user:", user);
    // Validate input
    if (!user || !user.id) {
      toast({
        title: "Login required",
        description: "You must be logged in to upload a function.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.name || !formData.runtime) {
      toast({
        title: "Missing fields",
        description: "Please provide a name and select a runtime.",
        variant: "destructive",
      });
      return;
    }
    if (uploadMode === "file" && !file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    if (uploadMode === "code" && !formData.code.trim()) {
      toast({
        title: "No code provided",
        description: "Please write your function code.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let response;
      if (uploadMode === "file") {
        // ---- FILE UPLOAD ----
        const data = new FormData();
        data.append("file", file);
        data.append("name", formData.name);
        data.append("runtime", formData.runtime);
        data.append("description", formData.description || "");
        data.append("userId", user.id);

        response = await backendApi.upload(
          `/api/functions/upload`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
              }
            },
          }
        );
      } else {
        // ---- CODE UPLOAD ----
        // Using multipart to support large code/text
        const data = new FormData();
        data.append("code", formData.code);
        data.append("name", formData.name);
        data.append("runtime", formData.runtime);
        data.append("description", formData.description || "");
        data.append("userId", user.id);

        response = await backendApi.upload(
          `/api/functions/uploadText`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
              }
            },
          }
        );
      }

      // On success:
      setUploading(false);
      setUploadProgress(100);
      toast({
        title: "Upload successful!",
        description: `Function "${formData.name}" has been uploaded successfully.`,
      });
      setFormData({ name: "", runtime: "", description: "", commandLineArgs: "", code: "" });
      setFile(null);

    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description:
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Could not upload the function.",
        variant: "destructive",
      });
    }
  };


  const getFileIcon = () => {
    if (!file) return <UploadIcon className="h-8 w-8 text-muted-foreground" />;
    const fileType = file.name.split('.').pop()?.toLowerCase();
    switch (fileType) {
      case 'js':
        return <File className="h-8 w-8 text-yellow-500" />;
      case 'py':
        return <File className="h-8 w-8 text-green-500" />;
      case 'java':
        return <File className="h-8 w-8 text-red-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Upload Function</h1>
          <p className="text-muted-foreground mt-2">Deploy your serverless function to FlexiFaaS</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5 text-primary" />
              Function Details
            </CardTitle>
            <CardDescription>
              Provide information about your serverless function
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Mode Selection */}
              <div className="space-y-2">
                <Label>Upload Method</Label>
                <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="flex items-center gap-2">
                      <UploadIcon className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Write Code
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="file" className="space-y-4 mt-4">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".js,.ts,.py,.go,.java,.zip,.tar.gz"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-4">
                        {getFileIcon()}
                        {file ? (
                          <div className="text-center">
                            <p className="font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">File selected</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-lg font-medium text-foreground">
                              Drag & drop your function file here
                            </p>
                            <p className="text-sm text-muted-foreground">
                              or click to browse files
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Supports: .js, .ts, .py, .go, .java, .zip, .tar.gz (max 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="code" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Function Code</Label>
                      <Textarea
                        id="code"
                        name="code"
                        placeholder={`// Write your function code here...
export function handler(event, context) {
  // Your function logic
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from FlexiFaaS!' })
  };
}`}
                        value={formData.code}
                        onChange={handleChange}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Function Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Function Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="my-awesome-function"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Runtime Selection */}
              <div className="space-y-2">
                <Label htmlFor="runtime">Runtime</Label>
                <Select value={formData.runtime} onValueChange={(value) => setFormData({...formData, runtime: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select runtime environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {runtimes.map((runtime) => (
                      <SelectItem key={runtime.value} value={runtime.value}>
                        {runtime.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what your function does..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Command Line Arguments */}
              <div className="space-y-2">
                <Label htmlFor="commandLineArgs">Command Line Arguments (Optional)</Label>
                <Input
                  id="commandLineArgs"
                  name="commandLineArgs"
                  placeholder="--arg1 value1 --arg2 value2"
                  value={formData.commandLineArgs}
                  onChange={handleChange}
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Upload Progress</Label>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Requirements Hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Requirements</p>
                    <ul className="text-sm text-blue-800 mt-1 space-y-1">
                      <li>• Function must export a main handler function</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Include package.json/requirements.txt if needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant"
                disabled={uploading || (uploadMode === "file" ? !file : !formData.code.trim()) || !formData.name || !formData.runtime}
              >
                {uploading ? "Uploading..." : "Upload Function"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
