'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFFlipbookProps {
  pdfUrl: string;
  onClose: () => void;
  title: string;
}

export default function PDFFlipbook({ pdfUrl, onClose, title }: PDFFlipbookProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-800 text-white">
        <div className="font-bold text-xl truncate pr-4">{title}</div>
        <button 
          onClick={onClose} 
          className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors text-xl font-bold"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 bg-gray-900">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-white text-xl">Loading PDF...</div>}
          error={<div className="text-red-500 text-xl">Failed to load PDF</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl"
            width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 900) : 900}
          />
        </Document>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 text-white">
        <button 
          onClick={goToPrevPage} 
          disabled={pageNumber <= 1}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          <i className="fa-solid fa-chevron-left mr-2"></i> Previous
        </button>
        
        <span className="text-lg font-semibold">
          Page {pageNumber} of {numPages}
        </span>
        
        <button 
          onClick={goToNextPage} 
          disabled={pageNumber >= numPages}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          Next <i className="fa-solid fa-chevron-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
