'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  collectionCount: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [leaderboardData, rankData] = await Promise.all([
          api.get('/leaderboard'),
          api.get('/leaderboard/me'),
        ]);
        setLeaderboard(leaderboardData.data);
        setMyRank(rankData.data.rank);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cartoon-loader"></div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-500';
      default: return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* 标题 */}
      <div className="text-center mb-6 animate-bounce-in">
        <h1 className="text-3xl font-black text-gray-800 mb-2">🏆 排行榜</h1>
        <p className="text-gray-600">谁是顶级收藏家？</p>
      </div>

      {/* 我的排名 */}
      {myRank && (
        <div className="cartoon-card p-4 mb-6 text-center">
          <p className="text-gray-600 text-sm">我的排名</p>
          <p className="text-4xl font-black text-yellow-500">#{myRank}</p>
        </div>
      )}

      {/* 排行榜列表 */}
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className={`cartoon-card p-4 flex items-center gap-4 ${
              user?.id === entry.userId ? 'border-4 border-yellow-400' : ''
            }`}
          >
            {/* 排名 */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black ${getRankStyle(entry.rank)}`}>
              {getRankIcon(entry.rank)}
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <p className="font-bold text-gray-800">
                {entry.username}
                {user?.id === entry.userId && ' (你)'}
              </p>
              <p className="text-sm text-gray-500">
                💎 {entry.collectionCount} 件收藏
              </p>
            </div>

            {/* 收藏数量 */}
            <div className="text-right">
              <p className="text-2xl font-black text-primary">{entry.collectionCount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">🎯</p>
          <p className="text-gray-600">暂无排行数据</p>
          <button
            onClick={() => router.push('/map')}
            className="cartoon-btn mt-4"
          >
            去收集宝藏
          </button>
        </div>
      )}
    </div>
  );
}