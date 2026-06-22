import { Tabs } from 'expo-router';
import { Home, Package, QrCode, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#C8960C',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: { backgroundColor: '#1A2744', borderTopColor: '#2A3A5A' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="inventory" options={{ title: 'Inventory', tabBarIcon: ({ color }) => <Package color={color} size={22} /> }} />
      <Tabs.Screen name="qrcodes" options={{ title: 'QR Codes', tabBarIcon: ({ color }) => <QrCode color={color} size={22} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs>
  );
}
