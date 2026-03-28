// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import LogScreen from './src/screens/LogScreen';
import ChatScreen from './src/screens/ChatScreen';
import WeekReportScreen from './src/screens/WeekReportScreen';
import StudyGuideScreen from './src/screens/StudyGuideScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SubjectSelectScreen from './src/screens/SubjectSelectScreen';
import { COLORS } from './src/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Log" component={LogScreen} />
      <Stack.Screen name="SubjectSelect" component={SubjectSelectScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="WeekReport" component={WeekReportScreen} />
      <Stack.Screen name="StudyGuide" component={StudyGuideScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatMain" component={ChatScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function StudyGuideStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyGuideMain" component={StudyGuideScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 0.5,
              borderTopColor: COLORS.border,
              height: 70,
              paddingBottom: 12,
              paddingTop: 8,
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            tabBarIcon: ({ focused, color }) => {
              const icons = {
                Dashboard: focused ? 'home' : 'home-outline',
                'AI Coach': focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
                Guides: focused ? 'book' : 'book-outline',
                Settings: focused ? 'settings' : 'settings-outline',
              };
              return <Ionicons name={icons[route.name]} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={HomeStack} />
          <Tab.Screen name="AI Coach" component={ChatStack} />
          <Tab.Screen name="Guides" component={StudyGuideStack} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
