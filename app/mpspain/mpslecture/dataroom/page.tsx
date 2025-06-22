'use client';

import { useState, useEffect } from 'react';
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
  FaFile,
  FaTrash
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  upload_date: string;
  download_url: string;
  user?: {
    mb_nick: string;
  };
}

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const UploadButton = ({ onUpload }: { onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="ml-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center gap-2">
    <FaUpload />
    <span>파일 업로드</span>
    <input
      type="file"
      className="hidden"
      onChange={onUpload}
    />
  </label>
);

const isAdmin = (user: User | null): user is User => {
  return user !== null && user.mb_level >= 8;
};

const Dataroom = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check user authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/form/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/form/login');
    }
  }, [router]);

  // 파일 목록 가져오기를 별도의 useEffect로 분리
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, currentPage, searchTerm]);

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/form/login');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL을 환경변수에서 가져오기
    if (!apiUrl) {
      console.error('API URL is not defined');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/api/files`, {
        params: {
          page: currentPage,
          search: searchTerm || undefined
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFiles(response.data.data.files);
        setTotalPages(response.data.data.totalPages);
      } else {
        console.error('Failed to fetch files:', response.data.message);
        alert('파일 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          router.push('/form/login');
        } else if (error.response?.status === 404) {
          console.error('API URL:', `${apiUrl}/api/files`);
          alert('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
        } else {
          alert('파일 목록을 불러오는데 실패했습니다.');
        }
      } else {
        alert('파일 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || user.mb_level < 8) {
      alert('관리자만 파일을 업로드할 수 있습니다.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/form/login');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    const encodedFileName = encodeURIComponent(file.name);
    formData.append('file', file, encodedFileName);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL을 환경변수에서 가져오기
    if (!apiUrl) {
      console.error('API URL is not defined');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${apiUrl}/api/files/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('파일이 성공적으로 업로드되었습니다.');
        // 파일 업로드 후 현재 페이지의 파일 목록 다시 가져오기
        await fetchFiles();
      } else {
        alert(response.data.message || '파일 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/form/login');
      } else {
        alert('파일 업로드에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const decodeFileName = (name: string) => {
    try {
      const decodedName = decodeURIComponent(name);
      // 확장자 제거
      return decodedName.replace(/\.[^/.]+$/, '');
    } catch (e) {
      return name.replace(/\.[^/.]+$/, '');
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!user || user.mb_level < 8) {
      alert('관리자만 파일을 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말로 이 파일을 삭제하시겠습니까?')) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL을 환경변수에서 가져오기
    if (!apiUrl) {
      console.error('API URL is not defined');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(`${apiUrl}/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert('파일이 성공적으로 삭제되었습니다.');
        // 파일 삭제 후 현재 페이지의 파일 목록 다시 가져오기
        await fetchFiles();
      } else {
        alert(response.data.message || '파일 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('파일 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return <FaFileExcel className="text-green-500" />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) return <FaFileImage className="text-purple-500" />;
    if (type.includes('text') || type.includes('txt')) return <FaFileAlt className="text-gray-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const getFileTypeLabel = (type: string) => {
    const lower = type.toLowerCase();

    if (lower.includes('pdf')) return 'PDF 문서';
    if (lower.includes('word') || lower.includes('doc')) return '워드 문서';
    if (lower.includes('excel') || lower.includes('sheet') || lower.includes('xls')) return '엑셀 문서';
    if (lower.includes('hwp')) return '한글 문서';
    if (lower.includes('image') || lower.includes('jpg') || lower.includes('png') || lower.includes('gif')) return '이미지 파일';
    if (lower.includes('text') || lower.includes('txt')) return '텍스트 파일';
    return '기타 파일';
  };

  const formatFileSize = (size: string) => {
    const bytes = parseInt(size, 10);
    if (isNaN(bytes)) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    // 소수점 1자리까지 표시
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 10;
    
    let startPage = Math.max(1, Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (startPage > 1) {
      pages.push(
        <button
          key="prev-group"
          onClick={() => handlePageChange(startPage - 1)}
          className="px-3 py-1 rounded hover:bg-slate-100"
        >
          ...
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
          key="next-group"
          onClick={() => handlePageChange(endPage + 1)}
          className="px-3 py-1 rounded hover:bg-slate-100"
        >
          ...
        </button>
      );
    }

    return pages;
  };

  return (
    <section className="w-full min-h-screen bg-slate-50 p-8 mt-30 mb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">자료실</h1>
        
        {/* 검색 및 업로드 영역 */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="파일명으로 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 검색 시 첫 페이지로 이동
              }}
            />
            <FaSearch className="absolute left-3 top-3 text-slate-400" />
          </div>
          
          {isAdmin(user) && <UploadButton onUpload={handleFileUpload} />}
        </div>

        {/* 검색 결과 표시 */}
        {searchTerm && (
          <div className="mb-4 text-sm text-slate-600">
            "{searchTerm}" 검색 결과
          </div>
        )}

        {/* 파일 목록 */} 
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100 text-sm font-medium text-slate-600">
            <div className="col-span-5">파일명</div>
            <div className="col-span-2">유형</div>
            <div className="col-span-2">크기</div>
            <div className="col-span-2">업로드 날짜</div>
            <div className="col-span-1">작업</div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500">로딩 중...</div>
            ) : files.length === 0 ? (
              <div className="p-4 text-center text-slate-500">등록된 파일이 없습니다.</div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50">
                  <div className="col-span-5 flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <span className="text-slate-700">{decodeFileName(file.name)}</span>
                  </div>
                  <div className="col-span-2 text-slate-600">{getFileTypeLabel(file.type)}</div>
                  <div className="col-span-2 text-slate-600">{formatFileSize(file.size)}</div>
                  <div className="col-span-2 text-slate-600">
                    {new Date(file.upload_date).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}${file.download_url}`} // 경로 수정
                      download
                      className="text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      다운로드
                    </a>
                    {isAdmin(user) && (
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
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
