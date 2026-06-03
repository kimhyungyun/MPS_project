'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type ClassGroup = 'A' | 'B' | 'S';

type LectureType =
  | 'single'
  | 'packageA'
  | 'packageB'
  | 'packageC'
  | 'packageD'
  | 'packageE';

interface Lecture {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  type: LectureType;
  classGroup: ClassGroup;
  day: number | null;
  sortOrder: number;
  categoryId: number | null;
  instructorId: number | null;
  video_folder?: string | null;
  video_name?: string | null;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditLecturePage({ params }: PageProps) {
  const router = useRouter();

  const [lectureId, setLectureId] = useState('');
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setLectureId(resolved.id);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (lectureId) {
      fetchLecture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchLecture = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not defined');

      const response = await fetch(`${apiUrl}/api/lectures/${lectureId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lecture');
      }

      const data = await response.json();

      setLecture({
        ...data,
        day: data.day ?? null,
        sortOrder: data.sortOrder ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch lecture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = <K extends keyof Lecture>(
    key: K,
    value: Lecture[K],
  ) => {
    if (!lecture) return;
    setLecture({ ...lecture, [key]: value });
  };

  const isClassGroupLecture = (targetLecture: Lecture) => {
    return targetLecture.classGroup === 'A' || targetLecture.classGroup === 'B';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecture) return;

    const shouldUseClassSort = isClassGroupLecture(lecture);

    setIsSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not defined');

      await axios.patch(
        `${apiUrl}/api/lectures/${lectureId}`,
        {
          title: lecture.title,
          description: lecture.description,
          price: Number(lecture.price),
          thumbnail_url: lecture.thumbnail_url,
          type: lecture.type,
          classGroup: lecture.classGroup,

          day: shouldUseClassSort
            ? lecture.day === null
              ? null
              : Number(lecture.day)
            : null,

          sortOrder: shouldUseClassSort ? Number(lecture.sortOrder ?? 0) : 0,

          categoryId: lecture.categoryId,
          instructorId: lecture.instructorId,
          video_folder: lecture.video_folder,
          video_name: lecture.video_name,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      alert('저장되었습니다.');
      router.push('/admin/lectures');
    } catch (error) {
      console.error('Failed to update lecture:', error);
      alert('저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">강의를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const shouldShowClassSortFields = isClassGroupLecture(lecture);

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">강의 수정</h1>
          <p className="mt-2 text-sm text-gray-500">ID: {lecture.id}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white shadow rounded-lg p-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              제목
            </label>
            <input
              type="text"
              value={lecture.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              value={lecture.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              가격
            </label>
            <input
              type="number"
              value={lecture.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              썸네일 URL
            </label>
            <input
              type="text"
              value={lecture.thumbnail_url}
              onChange={(e) => handleChange('thumbnail_url', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              강의 타입
            </label>
            <select
              value={lecture.type}
              onChange={(e) =>
                handleChange('type', e.target.value as LectureType)
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="single">single</option>
              <option value="packageA">packageA</option>
              <option value="packageB">packageB</option>
              <option value="packageC">packageC</option>
              <option value="packageD">packageD</option>
              <option value="packageE">packageE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              classGroup
            </label>
            <select
              value={lecture.classGroup}
              onChange={(e) => {
                const nextClassGroup = e.target.value as ClassGroup;

                setLecture({
                  ...lecture,
                  classGroup: nextClassGroup,
                  day:
                    nextClassGroup === 'A' || nextClassGroup === 'B'
                      ? lecture.day
                      : null,
                  sortOrder:
                    nextClassGroup === 'A' || nextClassGroup === 'B'
                      ? lecture.sortOrder ?? 0
                      : 0,
                });
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="S">싱글</option>
              <option value="A">상지반</option>
              <option value="B">하지반</option>
            </select>
          </div>

          {shouldShowClassSortFields && (
            <div className="grid grid-cols-1 gap-6 rounded-md border border-blue-100 bg-blue-50 p-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  일차
                </label>
                <select
                  value={lecture.day ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'day',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="">일차 없음</option>
                  <option value={1}>1일차</option>
                  <option value={2}>2일차</option>
                  <option value={3}>3일차</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  일차 내 정렬 순서
                </label>
                <input
                  type="number"
                  min={0}
                  value={lecture.sortOrder ?? 0}
                  onChange={(e) =>
                    handleChange('sortOrder', Number(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                  placeholder="예: 1"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              categoryId
            </label>
            <input
              type="number"
              value={lecture.categoryId ?? ''}
              onChange={(e) =>
                handleChange(
                  'categoryId',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="예: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              instructorId
            </label>
            <input
              type="number"
              value={lecture.instructorId ?? ''}
              onChange={(e) =>
                handleChange(
                  'instructorId',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="예: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              video_folder
            </label>
            <input
              type="text"
              value={lecture.video_folder ?? ''}
              onChange={(e) => handleChange('video_folder', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="예: sternocleidomastoidfinals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              video_name
            </label>
            <input
              type="text"
              value={lecture.video_name ?? ''}
              onChange={(e) => handleChange('video_name', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="예: 2_1sternocleidomastoid_final"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/lectures')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}