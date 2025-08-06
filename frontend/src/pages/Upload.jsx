import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { AppLayout } from "../components/layout/AppLayout";
import { Upload as UploadIcon, File, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const runtimes = [
  { value: "nodejs18", label: "Node.js 18" },
  { value: "nodejs20", label: "Node.js 20" },
  { value: "python39", label: "Python 3.9" },
  { value: "python310", label: "Python 3.10" },
  { value: "python311", label: "Python 3.11" },
  { value: "go119", label: "Go 1.19" },
  { value: "java11", label: "Java 11" },
  { value: "dotnet6", label: ".NET 6" },
];

export default function Upload() {
  const [formData, setFormData] = useState({
    name: "",
    runtime: "",
    description: "",
    commandLineArgs: "",
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

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

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Upload successful!",
            description: `Function "${formData.name}" has been uploaded successfully.`,
          });
          // Reset form
          setFormData({ name: "", runtime: "", description: "", commandLineArgs: "" });
          setFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    simulateUpload();
  };

  const getFileIcon = () => {
    if (!file) return <UploadIcon className="h-8 w-8 text-muted-foreground" />;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    switch (fileType) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <File className="h-8 w-8 text-yellow-500" />;
      case 'py':
        return <File className="h-8 w-8 text-green-500" />;
      case 'go':
        return <File className="h-8 w-8 text-blue-500" />;
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
              {/* File Upload Area */}
              <div className="space-y-2">
                <Label>Function File</Label>
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
                disabled={uploading || !file || !formData.name || !formData.runtime}
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
