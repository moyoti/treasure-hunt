import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/achievements/me');
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAchievements();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD93D" />
      </View>
    );
  }

  const completedCount = achievements.filter(a => a.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>🏅 成就</Text>
        <Text style={styles.subtitle}>已完成 {completedCount} / {achievements.length}</Text>
      </View>

      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / achievements.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* 列表 */}
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.achievement.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, item.completed && styles.completedCard]}>
            <View style={styles.row}>
              <Text style={[styles.icon, !item.completed && styles.grayIcon]}>
                {item.achievement.icon}
              </Text>
              <View style={styles.info}>
                <Text style={styles.name}>{item.achievement.name}</Text>
                <Text style={styles.description}>{item.achievement.description}</Text>
                {!item.completed && (
                  <View style={styles.miniProgress}>
                    <View
                      style={[
                        styles.miniProgressFill,
                        { width: `${(item.progress / item.achievement.requirement) * 100}%` }
                      ]}
                    />
                  </View>
                )}
              </View>
              {item.completed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#DDD',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 4,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#333',
  },
  completedCard: {
    borderColor: '#FFD93D',
    borderWidth: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginRight: 15,
  },
  grayIcon: {
    opacity: 0.4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  miniProgress: {
    height: 6,
    backgroundColor: '#DDD',
    borderRadius: 3,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#FFD93D',
    borderRadius: 2,
  },
  checkmark: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: '900',
  },
});