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
  shareUrl?: string;
}

export default function PDFFlipbook({ pdfUrl, onClose, title, shareUrl }: PDFFlipbookProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `🔥 Check out this deal: ${title}`,
      url: shareUrl || (typeof window !== 'undefined' ? window.location.href : '')
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch (err) {
        prompt('Copy this link to share:', shareData.url);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
      {/* Top toolbar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 text-white gap-3">
        <div className="font-bold text-sm md:text-base truncate flex-1 pr-2">{title}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            <i className="fa-solid fa-share-nodes"></i>
            <span className="hidden sm:inline">Share</span>
          </button>
          {/* Download */}
          <a
            href={pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            <i className="fa-solid fa-download"></i>
            <span className="hidden sm:inline">Download</span>
          </a>
          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition text-base font-bold"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* PDF content */}
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

      {/* Bottom nav */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 text-white">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition text-sm"
        >
          <i className="fa-solid fa-chevron-left mr-2"></i>Prev
        </button>
        <span className="text-sm font-semibold min-w-[100px] text-center">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition text-sm"
        >
          Next <i className="fa-solid fa-chevron-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
