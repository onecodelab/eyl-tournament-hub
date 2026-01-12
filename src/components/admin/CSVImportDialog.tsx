import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface CSVImportDialogProps {
  title: string;
  description: string;
  templateGenerator: () => string;
  templateFilename: string;
  onImport: (file: File) => Promise<{ success: number; errors: string[] }>;
  triggerButton?: React.ReactNode;
  disabled?: boolean;
}

export function CSVImportDialog({
  title,
  description,
  templateGenerator,
  templateFilename,
  onImport,
  triggerButton,
  disabled = false,
}: CSVImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const content = templateGenerator();
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = templateFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setResult({ success: 0, errors: ["Please select a CSV file"] });
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      const importResult = await onImport(selectedFile);
      setResult(importResult);
      if (importResult.success > 0 && importResult.errors.length === 0) {
        // Auto close after successful import
        setTimeout(() => {
          setOpen(false);
          resetState();
        }, 2000);
      }
    } catch (error: any) {
      setResult({ success: 0, errors: [error.message || "Import failed"] });
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2" disabled={disabled}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="space-y-4 py-4 pr-4">
            {/* Download Template */}
            <div className="p-4 border border-dashed rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Download Template</p>
                  <p className="text-xs text-muted-foreground">
                    Get the CSV template with required columns
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select CSV File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-2">
                {result.success > 0 && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-600">
                      Successfully imported {result.success} records
                    </AlertDescription>
                  </Alert>
                )}

                {result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-1">
                        {result.errors.length} error{result.errors.length > 1 ? "s" : ""} found:
                      </p>
                      <ul className="list-disc list-inside text-xs space-y-1 max-h-32 overflow-y-auto">
                        {result.errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                        {result.errors.length > 10 && (
                          <li>...and {result.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            className="gap-2"
          >
            {importing ? (
              <>
                <span className="animate-spin">⏳</span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
