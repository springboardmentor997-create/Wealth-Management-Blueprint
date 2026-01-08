import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';
import { ErrorHandler, ErrorLogger, type AppError } from '@/utils/errorHandler';
import { 
  Upload, 
  Download,
  FileDown, 
  Eye, 
  FileText, 
  Table, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ReportFile {
  id: string;
  name: string;
  type: 'pdf' | 'csv';
  size: number;
  uploaded_at: string;
  status: 'processing' | 'ready' | 'error';
}

const Reports = () => {
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'csv'>('pdf');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewFile, setPreviewFile] = useState<ReportFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  // Clean up preview URL when dialog closes
  useEffect(() => {
    if (!previewFile && previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewFile]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await apiClient.getReports();
      
      if (error) {
        throw error;
      }
      
      setFiles(data || []);
    } catch (error) {
      const appError = error as AppError;
      ErrorLogger.logError(appError, 'Fetching reports');
      toast({
        title: ErrorHandler.getErrorTitle(appError),
        description: ErrorHandler.getErrorMessage(appError),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const { error } = await apiClient.generatePortfolioReport();
      
      if (error) throw error;
      
      toast({
        title: 'Report generated',
        description: 'Your portfolio report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = {
      pdf: ['application/pdf'],
      csv: ['text/csv', 'application/csv']
    };

    if (!allowedTypes[fileType].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: `Please select a ${fileType.toUpperCase()} file.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      // Use the dedicated uploadReport method which handles file_type correctly
      const { data, error } = await apiClient.uploadReport(selectedFile, fileType);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Upload successful',
        description: 'Your file has been uploaded successfully.',
      });

      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      fetchFiles(); // Refresh the list
    } catch (error) {
      const appError = error as AppError;
      ErrorLogger.logError(appError, 'File upload');
      toast({
        title: ErrorHandler.getErrorTitle(appError),
        description: ErrorHandler.getErrorMessage(appError),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: ReportFile) => {
    try {
      const { data, error } = await apiClient.downloadFile(file.id);
      
      if (error) {
        throw error;
      }

      // Create download link
      const url = window.URL.createObjectURL(data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your file download has started.',
      });
    } catch (error) {
      const appError = error as AppError;
      ErrorLogger.logError(appError, 'File download');
      toast({
        title: ErrorHandler.getErrorTitle(appError),
        description: ErrorHandler.getErrorMessage(appError),
        variant: 'destructive',
      });
    }
  };

  const handlePreview = async (file: ReportFile) => {
    if (file.type === 'pdf') {
      try {
        const { data, error } = await apiClient.downloadFile(file.id);
        
        if (error) {
          throw error;
        }

        const url = window.URL.createObjectURL(data as Blob);
        setPreviewUrl(url);
        setPreviewFile(file);
      } catch (error) {
        const appError = error as AppError;
        ErrorLogger.logError(appError, 'File preview');
        toast({
          title: 'Preview failed',
          description: 'Could not load the file preview.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Preview not available',
        description: 'CSV files cannot be previewed. Please download to view.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      const { error } = await apiClient.deleteReport(reportId);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
      });

      fetchFiles(); // Refresh the list
    } catch (error) {
      const appError = error as AppError;
      ErrorLogger.logError(appError, 'File deletion');
      toast({
        title: ErrorHandler.getErrorTitle(appError),
        description: ErrorHandler.getErrorMessage(appError),
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return type === 'pdf' ? <FileText className="h-5 w-5" /> : <Table className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Manage your PDF and CSV reports</p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <Button 
              variant="outline" 
              className="gap-2 mr-2"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Generate Portfolio Report
            </Button>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <Select value={fileType} onValueChange={(value: 'pdf' | 'csv') => setFileType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select File</Label>
                  <Input
                    type="file"
                    accept={fileType === 'pdf' ? '.pdf' : '.csv'}
                    onChange={handleFileSelect}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 10MB
                  </p>
                </div>
                {selectedFile && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                )}
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload your first PDF or CSV report to get started.
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                        <span>•</span>
                        {getStatusBadge(file.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.type === 'pdf' && file.status === 'ready' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {file.status === 'ready' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* PDF Preview Dialog */}
        {previewFile && (
          <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>{previewFile.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                {previewUrl && (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default Reports;
