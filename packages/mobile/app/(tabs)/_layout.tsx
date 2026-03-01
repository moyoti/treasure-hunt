import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFF8E7',
          borderTopColor: '#333',
          borderTopWidth: 3,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#FFD93D',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: '#FFF8E7',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: '地图',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: '收藏',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: '成就',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medal" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: '排行',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size + 4} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}