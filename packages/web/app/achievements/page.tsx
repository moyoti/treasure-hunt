'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: string;
}

interface UserAchievement {
  achievement: Achievement;
  progress: number;
  completed: boolean;
  completedAt: string | null;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchAchievements = async () => {
      try {
        const response = await api.get('/achievements/me');
        setAchievements(response.data);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cartoon-loader"></div>
      </div>
    );
  }

  const completedCount = achievements.filter(a => a.completed).length;

  return (
    <div className="min-h-screen p-4 pb-20" style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)' }}>
      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-gray-800 mb-2">🏅 成就</h1>
        <p className="text-gray-600">已完成 {completedCount} / {achievements.length}</p>
      </div>

      {/* 进度条 */}
      <div className="cartoon-card p-4 mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-gray-800">
          <div
            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 成就列表 */}
      <div className="space-y-3">
        {achievements.map((item) => (
          <div
            key={item.achievement.id}
            className={`cartoon-card p-4 ${item.completed ? 'border-4 border-yellow-400' : 'opacity-70'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`text-4xl ${item.completed ? '' : 'grayscale'}`}>
                {item.achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.achievement.name}</h3>
                <p className="text-sm text-gray-600">{item.achievement.description}</p>
                {!item.completed && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2 border border-gray-400">
                    <div
                      className="bg-yellow-400 h-full rounded-full"
                      style={{ width: `${(item.progress / item.achievement.requirement) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              {item.completed && (
                <div className="text-green-500 text-2xl">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}