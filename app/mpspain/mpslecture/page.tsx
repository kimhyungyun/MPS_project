'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string;
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MpsLecture = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lectures`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const VideoPlayer = ({ videoId, userId }: { videoId: string; userId: string }) => {
    const [otp, setOtp] = useState('');
    const [playbackInfo, setPlaybackInfo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchToken = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found');
          }

          const res = await axios.get('/api/vdocipher/play-token', {
            params: { videoId, userId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setOtp(res.data.otp);
          setPlaybackInfo(res.data.playbackInfo);
        } catch (err) {
          console.error('토큰 요청 실패:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchToken();
    }, [videoId, userId]);

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">영상 불러오는 중입니다...</p>
        </div>
      );
    }

    if (!otp || !playbackInfo) {
      return (
        <div className="text-center mt-20 text-red-600">
          영상 정보를 불러오지 못했습니다.
        </div>
      );
    }

    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
        <iframe
          src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
          width="100%"
          height="100%"
          allowFullScreen
          allow="encrypted-media"
        />
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">MPS 강의실</h1>
        {isLoading ? (
          <p className="text-center text-gray-500">강의 목록을 불러오는 중입니다...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl"
                onClick={() => setSelectedCourse(course)}
              >
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-600 text-sm">{course.description}</p>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedCourse(null)}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4">{selectedCourse.title}</h2>
              <VideoPlayer
                videoId={selectedCourse.video_url}
                userId={"test-user-id"}
              />
              <p className="text-gray-700 mt-4">{selectedCourse.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MpsLecture;
