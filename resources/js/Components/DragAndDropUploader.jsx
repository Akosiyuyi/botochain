import { FileInput, Label } from "flowbite-react";
import { Upload, Download, Trash2 } from "lucide-react";
import { useForm } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';

export default function DragAndDropUploader({ setResults, setExpectedSchoolLevel }) {
  const [file, setFile] = useState(null);
  const { setData, post, reset } = useForm({
    file: null
  });

  //  --- file change or file selection ---
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/admin/bulk-upload/stage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(response.data.results);
      console.log(response.data.expectedSchoolLevel);

      // You can set state here to render preview tables
      setResults(response.data.results);
      setExpectedSchoolLevel(response.data.expectedSchoolLevel);
    } catch (error) {
      console.error(error);
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
      forceFormData: true, // 👈 tells Inertia to use FormData
      onSuccess: () => {
        toast.success('File uploaded successfully!');
        reset();
        setFile(null);
        document.getElementById("dropzone-file").value = "";
      },
      onError: () => toast.error('Upload failed. Please try again.')
    });
  };

  //  --- download excel format ---
  const handleDownloadExcel = () => {
    window.location.href = route('admin.bulk-upload.template');
  };

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-3">
      <Label
        htmlFor="dropzone-file"
        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pb-4 pt-4">
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
        </div>
        <FileInput id="dropzone-file" className="hidden" onChange={handleFileChange} />
      </Label>

      {/* Always visible selected file label */}
      <p className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
        Selected file: <span className="font-medium">{file ? file.name : "No file selected"}</span>
      </p>

      {/* Buttons */}
      <div className="flex w-full justify-start space-x-3">
        <button
          onClick={handleUpload}
          disabled={!file}
          className="flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          type="button"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </button>

        <button
          onClick={handleDownloadExcel}
          className="flex items-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          type="button"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Excel Format
        </button>

        {file && (
          <button
            onClick={handleRemoveFile}
            className="flex items-center rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            type="button"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove File
          </button>
        )}
      </div>
    </div>
  );
}
