import { FileInput, Label } from "flowbite-react";
import { Upload, Download, Trash2, Loader2 } from "lucide-react";
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function DragAndDropUploader({ setResults, setExpectedSchoolLevel }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setData, post, reset, processing } = useForm({
    file: null
  });

  //  --- file change or file selection ---
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv", // .csv
    ];
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(selectedFile.type) && !["xlsx", "csv"].includes(fileExtension)) {
      toast.error("Only XLSX or CSV files are allowed.");
      return;
    }

    // ✅ update both local state and Inertia form data
    setFile(selectedFile);
    setData("file", selectedFile);

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsProcessing(true);
    try {
      const response = await axios.post("/admin/bulk-upload/stage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResults(response.data.results);
      setExpectedSchoolLevel(response.data.expectedSchoolLevel);
      toast.success("File processed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  //  --- file removal ---
  const handleRemoveFile = () => {
    setFile(null);
    document.getElementById("dropzone-file").value = "";

    // clear staged preview data
    setResults(null);
    setExpectedSchoolLevel(null);
  };

  //  --- file upload ---
  const handleUpload = () => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    post(route('admin.bulk-upload.store'), {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        reset();
        setFile(null);
        setResults(null);
        setExpectedSchoolLevel(null);
        document.getElementById("dropzone-file").value = "";
      }
    });
  };

  //  --- download excel format ---
  const handleDownloadExcel = () => {
    window.location.href = route('admin.bulk-upload.template');
  };

  const isLoading = isProcessing || processing;

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4">
      <Label
        htmlFor="dropzone-file"
        className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
          isLoading
            ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600'
        }`}
      >
        <div className="flex flex-col items-center justify-center pb-4 pt-4">
          {isLoading ? (
            <>
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="mb-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                Processing file...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please wait while we validate your data
              </p>
            </>
          ) : (
            <>
              <svg
                className="mb-3 h-6 w-6 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload spreadsheet file (XLSX or CSV)
              </p>
            </>
          )}
        </div>
        <FileInput 
          id="dropzone-file" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </Label>

      {/* Selected file label */}
      <div className="w-full">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Selected file: <span className="font-medium">{file ? file.name : "No file selected"}</span>
        </p>
      </div>

      {/* Responsive Buttons */}
      <div className="flex w-full flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
          type="button"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload File</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadExcel}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
          type="button"
        >
          <Download className="h-4 w-4" />
          <span>Download Template</span>
        </button>

        {file && (
          <button
            onClick={handleRemoveFile}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            <span>Remove File</span>
          </button>
        )}
      </div>
    </div>
  );
}
