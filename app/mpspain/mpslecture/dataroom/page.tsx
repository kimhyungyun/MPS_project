'use client';

import { useState } from 'react';
import { 
  FaFilePdf, 
  FaUpload, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileAlt,
  FaFile
} from 'react-icons/fa';

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  downloadUrl: string;
}

const Dataroom = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 1,
      name: '강의자료_1.pdf',
      type: 'PDF',
      size: '2.5MB',
      uploadDate: '2024-03-20',
      downloadUrl: '/files/lecture1.pdf'
    },
    {
      id: 2,
      name: '강의자료_2.pdf',
      type: 'PDF',
      size: '1.8MB',
      uploadDate: '2024-03-19',
      downloadUrl: '/files/lecture2.pdf'
    },
  ]);

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return <FaFileExcel className="text-green-500" />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return <FaFileImage className="text-purple-500" />;
    if (type.includes('text') || type.includes('txt')) return <FaFileAlt className="text-gray-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload logic
      const newFile: FileItem = {
        id: files.length + 1,
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        downloadUrl: URL.createObjectURL(file)
      };
      setFiles([newFile, ...files]);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = filteredFiles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 10;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-50"
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-emerald-600 text-white'
              : 'hover:bg-slate-100'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      );
    }

    return pages;
  };

  return (
    <section className="w-full min-h-screen bg-slate-50 p-8 mt-30">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">자료실</h1>
        
        {/* 검색 및 업로드 영역 */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="파일 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-slate-400" />
          </div>
          
          <label className="ml-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center gap-2">
            <FaUpload />
            <span>파일 업로드</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* 파일 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100 text-sm font-medium text-slate-600">
            <div className="col-span-5">파일명</div>
            <div className="col-span-2">유형</div>
            <div className="col-span-2">크기</div>
            <div className="col-span-2">업로드 날짜</div>
            <div className="col-span-1">다운로드</div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {currentFiles.map((file) => (
              <div key={file.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-slate-700">{file.name}</span>
                </div>
                <div className="col-span-2 text-slate-600">{file.type}</div>
                <div className="col-span-2 text-slate-600">{file.size}</div>
                <div className="col-span-2 text-slate-600">{file.uploadDate}</div>
                <div className="col-span-1">
                  <a
                    href={file.downloadUrl}
                    download
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    다운로드
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-200">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dataroom;